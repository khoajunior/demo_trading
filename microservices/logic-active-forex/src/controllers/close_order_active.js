const {
    FOREX_SL_BUY_ACTIVE_KEY, FOREX_TP_BUY_ACTIVE_KEY, 
    FOREX_SL_SELL_ACTIVE_KEY, FOREX_TP_SELL_ACTIVE_KEY,
    MAXIMUM_PRICE_STOCK, MINIMUM_PRICE_STOCK, COMPARE_TAKE_PROFIT_STOP_LOSS_MINIUM,
    EXCHANGE_LOGIC_SERVICE, PRICE_TYPE
} = require('../../constants/constants')
const {redis_db} = require('../core/redis_db')
const messageBroker = require('../core/message_broker')
const get_all_current_price = require('../helpers/get_all_current_price')

module.exports = () => new Promise(async(resolve, reject) => {
    try {
         
        const price_detail = await get_all_current_price(PRICE_TYPE)

        const  data_json_list  = Object.values(price_detail)
        for (var i = 0; i < data_json_list.length; i++) {
            const price_item = JSON.parse(data_json_list[i])

            const {ask, bid, asset} = price_item
     

            // order with buy => current_price to close is bid
            var current_price = bid

            // console.log(`${PRICE_TYPE}_${asset}${FOREX_TP_BUY_ACTIVE_KEY}`)

            const tp_buy_order_list = await redis_db.zrangebyscoreAsync(`${PRICE_TYPE}_${asset}${FOREX_TP_BUY_ACTIVE_KEY}`, MINIMUM_PRICE_STOCK, current_price + COMPARE_TAKE_PROFIT_STOP_LOSS_MINIUM)
            const sl_buy_order_list = await redis_db.zrangebyscoreAsync(`${PRICE_TYPE}_${asset}${FOREX_SL_BUY_ACTIVE_KEY}`, current_price - COMPARE_TAKE_PROFIT_STOP_LOSS_MINIUM , MAXIMUM_PRICE_STOCK)
            stop_order(current_price, [...tp_buy_order_list, ...sl_buy_order_list], PRICE_TYPE)
            
            
            // order with SELL => current_price to close is ASK
            current_price = ask
            const sl_sell_order_list = await redis_db.zrangebyscoreAsync(`${PRICE_TYPE}_${asset}${FOREX_SL_SELL_ACTIVE_KEY}`, MINIMUM_PRICE_STOCK , current_price + COMPARE_TAKE_PROFIT_STOP_LOSS_MINIUM)
            const tp_sell_order_list = await redis_db.zrangebyscoreAsync(`${PRICE_TYPE}_${asset}${FOREX_TP_SELL_ACTIVE_KEY}`, current_price - COMPARE_TAKE_PROFIT_STOP_LOSS_MINIUM, MAXIMUM_PRICE_STOCK)
            stop_order(current_price, [...sl_sell_order_list, ...tp_sell_order_list], PRICE_TYPE)


            const deleting_promise = []
            const deleting_list = [...new Set([
                ...tp_buy_order_list,
                ...sl_buy_order_list,
                ...sl_sell_order_list,
                ...tp_sell_order_list,
            ])]

            deleting_list.forEach(deleting_order_id => {
                const deleting_order_list1 = redis_db.zremAsync(`${PRICE_TYPE}_${asset}${FOREX_TP_BUY_ACTIVE_KEY}`, deleting_order_id)
                const deleting_order_list2 = redis_db.zremAsync(`${PRICE_TYPE}_${asset}${FOREX_SL_BUY_ACTIVE_KEY}`, deleting_order_id)
                const deleting_order_list3 = redis_db.zremAsync(`${PRICE_TYPE}_${asset}${FOREX_SL_SELL_ACTIVE_KEY}`, deleting_order_id)
                const deleting_order_list4 = redis_db.zremAsync(`${PRICE_TYPE}_${asset}${FOREX_TP_SELL_ACTIVE_KEY}`, deleting_order_id)
                deleting_promise.push(deleting_order_list1, deleting_order_list2, deleting_order_list3, deleting_order_list4)
            })

            if(deleting_promise.length > 0){
                await Promise.all(deleting_promise)
            }

        }


        return resolve(true)

    } catch (error) {
       
        return resolve(false)
    }
})


const stop_order = (close_price, order_list, price_type) => {
    const count_id_list = [...new Set(order_list)].map(item => parseInt(item, 10))

    if(!count_id_list || count_id_list.length == 0){
        return null
    }
    const pubChannel = messageBroker.getPublishChannel()

    const variable = {
        count_id_list,
        close_price,
        end_time: new Date().toISOString(),
        price_type
    };
    // console.log({variable})

    const format_data = JSON.stringify(variable)

    pubChannel.publish(EXCHANGE_LOGIC_SERVICE, 'data.active.forex', Buffer.from(format_data))
    return variable
}