const { redis_db } = require('../core/redis_db')
const message_broker = require('../core/message_broker')
const { HANDLE_MARGIN_LEVEL, TYPE_SELL, LIMIT, EXCHANGE_LOGIC_SERVICE, PRICE_TYPE, REALTIME_DEMO_ACCOUNT, TYPE_BUY } = require('../../constants/constants')
const get_all_current_price = require('../helpers/get_all_current_price')


module.exports = () => new Promise(async (resolve, reject) => {
    try {
        console.log("handle margin level")

        // console.log('handle margin level per seconds')
        const pubChannel = message_broker.getPublishChannel()

        // asset with object price 
        const price_detail = await get_all_current_price(PRICE_TYPE)

        //DEMO ACCOUNT WITH ('tournament_id/user_id': [{oder1}, {order2}])
        const demo_account = await redis_db.hmgetAsync(`${PRICE_TYPE}_${HANDLE_MARGIN_LEVEL}`)

        for (var key in demo_account) {
            const tournament_id = key.split('/')[0]
            const user_id = key.split('/')[1]
            const { order_list = [], total_margin, total_balance, handle_delete_margin = false, handle_leave_tournament = false} = JSON.parse(demo_account[key])


            // CASE1:  handle margin but sort delete in (handle_margin_forex_order_to_redis in data_demo_account_redis microservice) 
            // when not active order(take profit or stop lot) or pendin order => update new demo_account
            
            // CASE2: remove handle margin => remove demo_account 
            // (because demo account handle per second if can not handle simular) when leave tournament
            const demo_key = `${PRICE_TYPE}/${user_id}/${tournament_id}`

            if(handle_delete_margin || handle_leave_tournament){
               await redis_db.hmdelAsync(`${PRICE_TYPE}_${HANDLE_MARGIN_LEVEL}`, key)
            }

            if(handle_leave_tournament){
                await redis_db.hmdelAsync(REALTIME_DEMO_ACCOUNT, demo_key)
                continue

            }

            var total_net_profit_loss = 0

            var old_margin = 0
            var close_price = 0
            var order_id = ''
            var old_count_id = 0


            if (total_margin == 0 || handle_delete_margin) {
                const reset_demo_account = {
                    user_id,
                    tournament_id,
                    type: PRICE_TYPE,
                    balance: total_balance,
                    sum_profit_loss: 0,
                    sum_margin: 0,
                    margin_level: null,
                    equity: total_balance,
                    available: total_balance
                }
    
                await redis_db.hmsetAsync(REALTIME_DEMO_ACCOUNT, demo_key, JSON.stringify(reset_demo_account))
                continue
            }

            for (var i = 0; i < order_list.length; i++) {

                const { asset, open_price, fn_net_profit_loss, id, type, margin, count_id } = order_list[i]

                const price = JSON.parse(price_detail[asset])
                var current_price = price.ask
                if (type == TYPE_BUY) {
                    current_price = price.bid
                }

                if (margin > old_margin) {
                    old_margin = margin
                    close_price = current_price
                    order_id = id
                    old_count_id = count_id
                }

                const net_profit_loss = fn_net_profit_loss * (current_price - open_price)
                total_net_profit_loss += net_profit_loss
            }

            const equity = total_balance + total_net_profit_loss
            const margin_level = equity / total_margin * 100
            const available = equity - total_margin
            var is_setting_balance_to_rezo = false

            if (!equity || equity < 0 || !total_balance || total_balance < 0) {
                is_setting_balance_to_rezo = true
            }

            const user_account_order = {
                user_id,
                tournament_id,
                type: PRICE_TYPE,
                balance: total_balance,
                sum_profit_loss: total_net_profit_loss,
                sum_margin: total_margin,
                margin_level,
                equity,
                available
            }

            await redis_db.hmsetAsync(REALTIME_DEMO_ACCOUNT, demo_key, JSON.stringify( user_account_order))
            if (margin_level <= LIMIT) {
                // console.log({is_setting_balance_to_rezo, total_balance, equity, margin_level, user_id})

                // handling_count_id.push(old_count_id)

                // Fix order update database is late, when database update finish create score new for handle margin level
                // because need to create active => update to redis handle margin level (if is late. need to row fix here)
                // console.log({key})
                // await redis_db.hmdelAsync(HANDLE_MARGIN_LEVEL, key)


                console.log({ 'handling marigin level < 50%': order_id })

                const close_active_order = JSON.stringify({
                    id_list: [order_id],
                    close_price,
                    end_time: new Date().toISOString(),
                    count_id_list: [old_count_id],
                    price_type: PRICE_TYPE,
                    is_setting_balance_to_rezo
                })
                // console.log({close_active_order})


                pubChannel.publish(
                    EXCHANGE_LOGIC_SERVICE,
                    'data.active.forex',
                    Buffer.from(close_active_order)
                )

                const user_tournament = {
                    tournament_id,
                    user_id
                }

                const pending_item = JSON.stringify({
                    user_tournament,
                    price_type: PRICE_TYPE
                })


                pubChannel.publish(
                    EXCHANGE_LOGIC_SERVICE,
                    'data.close.pending_list_forex',
                    Buffer.from(pending_item)
                )
            }

        }

        return resolve(true)
    } catch (error) {
        console.log(error)
        return resolve(false)
    }

})

