const {
    STATUS_ACTIVE, TYPE_BUY, TYPE_SELL, STATUS_PENDING,
    FOREX_BUY_LIMIT_PENDING_KEY, FOREX_BUY_STOP_PENDING_KEY,
    FOREX_SELL_LIMIT_PENDING_KEY, FOREX_SELL_STOP_PENDING_KEY,

    FOREX_SL_BUY_ACTIVE_KEY, FOREX_TP_SELL_ACTIVE_KEY,
    FOREX_SL_SELL_ACTIVE_KEY, FOREX_TP_BUY_ACTIVE_KEY,
    REDIS_CREATE_ORDER, PRICE_OBJECT
} = require('../../constants/constants')

const { redis_db } = require('../core/redis_db')

// add order to redis
//handling pending - active
const save_or_update_order_to_redis = (order_item, has_override_status = false, redis_order_option = REDIS_CREATE_ORDER) => new Promise(async (resolve, reject) => {
    try {


        const promise_list = []
        const {price_type, order_list} = order_item

        for (var i = 0; i < order_list.length; i++) {
            const order = order_list[i]

            const { asset, status, take_profit, stop_loss, open_price, pending_price, type, count_id } = order

            var key = ''
            if (status == STATUS_ACTIVE || has_override_status) {

                if (type == TYPE_BUY && take_profit) {
                    key = FOREX_TP_BUY_ACTIVE_KEY


                    const type_1 = redis_db.zaddAsync(`${price_type}_${asset}${key}`, redis_order_option, take_profit, count_id)
                    promise_list.push(type_1)

                    // TODO TEST if turn on test_1 need to turn off promise_list
                    // await type_1
                    // const get_order_test = await redis_db.zscoreAsync(`${asset}${key}`, count_id)
                    // const get_scan = await redis_db.zscanAsync(`${asset}${key}`, 0)
                    // const compare_order = await redis_db.zrangebyscoreAsync(`${asset}${key}`, 0, 1.9)
                    // console.log('create active', { get_order_test, get_scan, count_id, compare_order , key})
                }

                if (type == TYPE_BUY && stop_loss) {
                    key = FOREX_SL_BUY_ACTIVE_KEY
                    const type_2 = redis_db.zaddAsync(`${price_type}_${asset}${key}`, redis_order_option, stop_loss, count_id)
                    promise_list.push(type_2)

                    // TODO TEST if turn on test_2 need to turn off promise_list
                    // await type_2
                    // const get_order_test = await redis_db.zscoreAsync(`${asset}${key}`, count_id)
                    // const get_scan = await redis_db.zscanAsync(`${asset}${key}`, count_id)
                    // const compare_order = await redis_db.zrangebyscoreAsync(`${asset}${key}`, 0, 1.17)
                    // console.log('create active', { get_order_test, get_scan, count_id, compare_order, key })
                }

                if (type == TYPE_SELL && take_profit) {
                    key = FOREX_TP_SELL_ACTIVE_KEY
                    const type_3 = redis_db.zaddAsync(`${price_type}_${asset}${key}`, redis_order_option, take_profit, count_id)
                    promise_list.push(type_3)

                    // // TODO TEST
                    // await type_3
                    // const get_order_test = await redis_db.zscoreAsync(`${asset}${key}`, count_id)
                    // const compare_order = await redis_db.zrangebyscoreAsync(`${asset}${key}`, "[0", "[12.00000000003")
                    // console.log('create active', { get_order_test, count_id, compare_order, key })
                }

                if (type == TYPE_SELL && stop_loss) {
                    key = FOREX_SL_SELL_ACTIVE_KEY
                    const type_4 = redis_db.zaddAsync(`${price_type}_${asset}${key}`, redis_order_option, stop_loss, count_id)
                    promise_list.push(type_4)

                    // TODO TEST
                    // await type_4
                    // const get_order_test = await redis_db.zscoreAsync(`${asset}${key}`, count_id)
                    // const compare_order = await redis_db.zrangebyscoreAsync(`${asset}${key}`, "[0", "[12.00000000003")
                    // console.log('create active', { get_order_test, count_id, compare_order, key })
                }

            } else {

                if (type === TYPE_BUY && open_price >= pending_price) {
                    key = FOREX_BUY_LIMIT_PENDING_KEY
                }

                if (type === TYPE_BUY && open_price < pending_price) {
                    key = FOREX_BUY_STOP_PENDING_KEY
                }

                if (type == TYPE_SELL && open_price >= pending_price) {
                    key = FOREX_SELL_STOP_PENDING_KEY
                }

                if (type == TYPE_SELL && open_price < pending_price) {
                    key = FOREX_SELL_LIMIT_PENDING_KEY

                }
                // console.log({open_price, pending_price, type, redis_order_option})

                const type_5 = redis_db.zaddAsync(`${price_type}_${asset}${key}`, pending_price, count_id)
                promise_list.push(type_5)
            }

            console.log('update pending to active---------------', `${price_type}_${asset}${key}`)


            // TODO TEST
            // await type_5
            // const get_order_test = await redis_db.zscoreAsync(`${asset}${key}`, count_id)
            // const compare_order = await redis_db.zrangebyscoreAsync(`${asset}${key}`, "[0", "[12.00000000003")
            // console.log('create pending', { get_order_test, count_id, compare_order, key })
        }


        if (promise_list.length > 0) {
            await Promise.all(promise_list)
        }

        return resolve('save order to redis success')
    } catch (error) {
        console.log(error)
        return reject(error)
    }
})


//overide_status when pending update to active (need to remove pending)
//handling pending - active
const remove_order_from_redis = (order_item, has_override_status = false) => new Promise(async (resolve, reject) => {
    try {
        const {price_type, order_list} = order_item

        const promise_list = []

        for (var i = 0; i < order_list.length; i++) {
            const order = order_list[i]

            const { asset, status, take_profit, stop_loss, open_price, pending_price, type, count_id } = order

            var key = 'test'

            if (type == TYPE_BUY && take_profit) {
                key = FOREX_TP_BUY_ACTIVE_KEY
                const type_1 = redis_db.zremAsync(`${price_type}_${asset}${key}`, count_id)
                promise_list.push(type_1)
            }

            if (type == TYPE_BUY && stop_loss) {
                key = FOREX_SL_BUY_ACTIVE_KEY
                const type_2 = redis_db.zremAsync(`${price_type}_${asset}${key}`, count_id)
                promise_list.push(type_2)
            }

            if (type == TYPE_SELL && take_profit) {
                key = FOREX_TP_SELL_ACTIVE_KEY
                const type_3 = redis_db.zremAsync(`${price_type}_${asset}${key}`, count_id)
                promise_list.push(type_3)
            }

            if (type == TYPE_SELL && stop_loss) {
                key = FOREX_SL_SELL_ACTIVE_KEY
                const type_4 = redis_db.zremAsync(`${price_type}_${asset}${key}`, count_id)
                promise_list.push(type_4)
            }
            
            if (pending_price) {
                if (type === TYPE_BUY && open_price >= pending_price) {
                    key = FOREX_BUY_LIMIT_PENDING_KEY
                }

                if (type === TYPE_BUY && open_price < pending_price) {
                    key = FOREX_BUY_STOP_PENDING_KEY
                }

                if (type == TYPE_SELL && open_price >= pending_price) {
                    key = FOREX_SELL_STOP_PENDING_KEY
                }

                if (type == TYPE_SELL && open_price < pending_price) {
                    key = FOREX_SELL_LIMIT_PENDING_KEY
                }

                const type_5 = redis_db.zremAsync(`${price_type}_${asset}${key}`, count_id)
                promise_list.push(type_5)
            }
            // console.log({key})

        }

        if (promise_list.length > 0) {
            await Promise.all(promise_list)
        }
        return resolve(true)

    } catch (error) {
        console.log(error)
        return reject(error)
    }
})




module.exports = {
    save_or_update_order_to_redis,
    remove_order_from_redis
}