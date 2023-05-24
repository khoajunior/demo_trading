const { redis_db } = require('../core/redis_db')
const message_broker = require('../core/message_broker')
const {
    FOREX_BUY_LIMIT_PENDING_KEY, FOREX_BUY_STOP_PENDING_KEY, EXCHANGE_LOGIC_SERVICE,
    FOREX_SELL_LIMIT_PENDING_KEY, FOREX_SELL_STOP_PENDING_KEY,
    MINIMUM_PRICE_STOCK, COMPARE_TAKE_PROFIT_STOP_LOSS_MINIUM, MAXIMUM_PRICE_STOCK, PRICE_TYPE
} = require('../../constants/constants')
const get_all_current_price = require('../helpers/get_all_current_price')

// zadd: asset-detail "order_id" "pending_price:order_id"
module.exports = () => new Promise(async (resolve, reject) => {
    try {
        // console.log('handle data pending-----------------------')
        // TODO offline

        const price_detail = await get_all_current_price(PRICE_TYPE)


        const  data_json_list  = Object.values(price_detail)
        for (var i = 0; i < data_json_list.length; i++) {
            const price_item = JSON.parse(data_json_list[i])
            

            const { ask, bid, asset } = price_item


            // buy order => open price is bid
            var current_price = ask
            // console.log(`${PRICE_TYPE}_${asset}${FOREX_BUY_LIMIT_PENDING_KEY}`, current_price)

            const buy_limit_order_list = await redis_db.zrangebyscoreAsync(`${PRICE_TYPE}_${asset}${FOREX_BUY_LIMIT_PENDING_KEY}`, current_price - COMPARE_TAKE_PROFIT_STOP_LOSS_MINIUM, MAXIMUM_PRICE_STOCK)
            const delete_order_list1 = buy_limit_order_list.map(buy_limit_order_id => {
                // console.log({ buy_limit_order_id })
                return redis_db.zremAsync(`${PRICE_TYPE}_${asset}${FOREX_BUY_LIMIT_PENDING_KEY}`, buy_limit_order_id)
            })

            const buy_stop_order_list = await redis_db.zrangebyscoreAsync(`${PRICE_TYPE}_${asset}${FOREX_BUY_STOP_PENDING_KEY}`, MINIMUM_PRICE_STOCK, current_price + COMPARE_TAKE_PROFIT_STOP_LOSS_MINIUM)
            const delete_order_list2 = buy_stop_order_list.map(buy_stop_order_id => {
                // console.log({buy_stop_order_id})
                return redis_db.zremAsync(`${PRICE_TYPE}_${asset}${FOREX_BUY_STOP_PENDING_KEY}`, buy_stop_order_id)
            })


            update_active(current_price, [
                ...buy_limit_order_list, ...buy_stop_order_list
            ], PRICE_TYPE)


            var current_price = bid


            const sell_stop_order_list = await redis_db.zrangebyscoreAsync(`${PRICE_TYPE}_${asset}${FOREX_SELL_STOP_PENDING_KEY}`, current_price - COMPARE_TAKE_PROFIT_STOP_LOSS_MINIUM, MAXIMUM_PRICE_STOCK)
            const delete_order_list3 = sell_stop_order_list.map(sell_stop_order_id => {
                // console.log({ sell_stop_order_id })
                return redis_db.zremAsync(`${PRICE_TYPE}_${asset}${FOREX_SELL_STOP_PENDING_KEY}`, sell_stop_order_id)
            })

            const sell_limit_order_list = await redis_db.zrangebyscoreAsync(`${PRICE_TYPE}_${asset}${FOREX_SELL_LIMIT_PENDING_KEY}`, MINIMUM_PRICE_STOCK, current_price + COMPARE_TAKE_PROFIT_STOP_LOSS_MINIUM)
            const delete_order_list4 = sell_limit_order_list.map(sell_limit_order_id => {
                // console.log({ sell_limit_order_list })
                return redis_db.zremAsync(`${PRICE_TYPE}_${asset}${FOREX_SELL_LIMIT_PENDING_KEY}`, sell_limit_order_id)
            })


            update_active(current_price, [...sell_limit_order_list, ...sell_stop_order_list], PRICE_TYPE)

            
            await Promise.all([
                ...delete_order_list1,
                ...delete_order_list2,
                ...delete_order_list3,
                ...delete_order_list4
            ])

        }

        return resolve(true)

    } catch (error) {
        // console.log(error)
        return resolve(false)
    }

})
const update_active = (open_price, order_list, price_type) => {

    if (!order_list || order_list.length == 0) {
        return null
    }

    const count_id_list = [...new Set(order_list)].map(item => parseInt(item, 10))
    

    const pubChannel = message_broker.getPublishChannel()

    const format_data = JSON.stringify({
        open_price,
        count_id_list,
        updated_at: new Date().toISOString(),
        start_time: new Date().toISOString(),
        price_type
    });

    // console.log({ format_data })

    pubChannel.publish(
        EXCHANGE_LOGIC_SERVICE,
        'data.pending.forex',
        Buffer.from(format_data)
    )
    return format_data
}

