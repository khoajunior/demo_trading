const { get_tournament_expired_or_deleted } = require('../services/tournament')
const { remove_order_from_redis } = require('../services/handle_pending_active')
const handle_margin = require('../services/handler_margin')
const cron = require('node-cron')
const { REALTIME_DEMO_ACCOUNT, TIME_TO_CHECKING_TOURNAMENT_EXP, MICROSERVICE_NAME,
    COMMODITY_TYPE, FOREX_TYPE, CRYPTO_TYPE, OPTION_BINARY_TRADE, OPTION_FOREX_TRADE,
    STOCK_TYPE, PRICE_OBJECT, TYPE_BUY, TYPE_SELL, CRON_ALL_SYSTEM, CHECK_TOURNAMENT_CLOSE_OR_DELETE, HANDLE_PROCCESSING, HANDLE_DONE } = require('../../constants/constants')
const { Sentry } = require('../core/sentry')
const get_all_current_price = require('../helpers/get_all_current_price')
const { redis_db } = require('../core/redis_db')
const { stop_order, stop_order_pending_in_tournament_expired_or_deleted } = require('../services/trade_forex_pg')
const { update_tournament, get_demo_account_in_tournament_finished } = require('../services/tournament')
const filter_user_tournament_unique = require('../helpers/filter_user_tournament_unique')

module.exports = () => {

    cron.schedule(TIME_TO_CHECKING_TOURNAMENT_EXP, async () => {
    // cron.schedule(' */1 * * * *', async () => {
        try {
            console.log("corn tournament expired", new Date().toISOString())
            var cron_status = await redis_db.hgetAsync(CRON_ALL_SYSTEM, CHECK_TOURNAMENT_CLOSE_OR_DELETE)

            if (cron_status == HANDLE_PROCCESSING) {
                return
            }
            
            Sentry.captureMessage(`${MICROSERVICE_NAME}:CRON_EXPIRED_DELETED_TOURNAMENT remove handle logic from redis`)
            const tournament_list = await get_tournament_expired_or_deleted()

            if (tournament_list && tournament_list.length == 0) {
                await redis_db.hmsetAsync(CRON_ALL_SYSTEM, CHECK_TOURNAMENT_CLOSE_OR_DELETE, HANDLE_DONE)
                return
            }

            await redis_db.hmsetAsync(CRON_ALL_SYSTEM, CHECK_TOURNAMENT_CLOSE_OR_DELETE, HANDLE_PROCCESSING)


            //Lấy current all asset
            const price_object_forex = await get_all_current_price(PRICE_OBJECT[FOREX_TYPE])
            const price_object_stock = await get_all_current_price(PRICE_OBJECT[STOCK_TYPE])
            const price_object_crypto = await get_all_current_price(PRICE_OBJECT[CRYPTO_TYPE])
            const price_object_commodity = await get_all_current_price(PRICE_OBJECT[COMMODITY_TYPE])


            for (var i = 0; i < tournament_list.length; i++) {

                const tournament = tournament_list[i]
                const { id: tournament_id, product_type, option_trade } = tournament

                var price_object = price_object_forex

                if (product_type === STOCK_TYPE) {
                    price_object = price_object_stock
                }

                if (product_type === CRYPTO_TYPE) {
                    price_object = price_object_crypto
                }

                if (product_type === COMMODITY_TYPE) {
                    price_object = price_object_commodity
                }

                if (!price_object || option_trade != OPTION_FOREX_TRADE) {
                    continue
                }

                const asset_list = Object.keys(price_object)

                // remove pending in database and redis
                const pending_order_list = await stop_order_pending_in_tournament_expired_or_deleted(tournament_id)


                //Đóng tất cả order

                const active_order_list = []
                for (var j = 0; j < asset_list.length; j++) {
                    const asset = asset_list[j]
                    const price = JSON.parse(price_object[asset])

                    var type = TYPE_BUY
                    var close_price = price.bid
                    var item = { tournament_id, close_price, type, asset }

                    var closed_order = await stop_order(item)
                    if(closed_order.length > 0){
                        active_order_list.push(closed_order)
                    }
                    
                    
                    type = TYPE_SELL
                    close_price = price.ask
                    item = { tournament_id, close_price, type, asset }
                    closed_order = await stop_order(item)

                    if(closed_order.length > 0){
                        active_order_list.push(closed_order)
                    }

                }
                const order_list = [...active_order_list, ...pending_order_list]
                const price_type = PRICE_OBJECT[product_type]

                if (order_list.length > 0) {
                    //Xóa order khỏi redis
                    const forex_item = {
                        price_type,
                        order_list
                    }
                    await remove_order_from_redis(forex_item)

                }

                //Xóa realtime demo-account của tất cả user trong tournament đã hết hạn or deleted
                const demo_account_list = await get_demo_account_in_tournament_finished(tournament_id)
                const handle_delete_promise = []
                for (var k = 0; k < demo_account_list.length; k++) {
                    const account_item = demo_account_list[k]
                    const account_price_type = PRICE_OBJECT[account_item.tournament.product_type]
                    const account_user_id = account_item.user_id
                    const account_tournament = account_item.tournament_id
                    const demo_account_key = `${account_price_type}/${account_user_id}/${account_tournament}`

                    //Xóa trong redis
                    const handle_delete = redis_db.hmdelAsync(REALTIME_DEMO_ACCOUNT, demo_account_key)
                    handle_delete_promise.push(handle_delete)
                }

                await Promise.all(handle_delete_promise)
                const user_tournament_list = filter_user_tournament_unique(demo_account_list)

                //Xoá order khỏi handle margin
                const handle_margin_input = {
                    price_type,
                    user_tournament_list
                }
                await handle_margin.remove_order(handle_margin_input)
                //Bật tournament is_finished lên lại để con cron reward check
                await update_tournament([tournament_id])
            }

            await redis_db.hmsetAsync(CRON_ALL_SYSTEM, CHECK_TOURNAMENT_CLOSE_OR_DELETE, HANDLE_DONE)
            return true

        } catch (error) {
            console.log(error)
            await redis_db.hmsetAsync(CRON_ALL_SYSTEM, CHECK_TOURNAMENT_CLOSE_OR_DELETE, HANDLE_DONE)
            Sentry.captureException(error)
            return false
        }
    })

}


