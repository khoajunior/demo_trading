const { COUNTER_KEY_FOR_CHECK_TIME, CACHE_SOCKET_COUNTER } = require('../../constants/constants')
const { redis_db } = require('../core/redis_db')

module.exports = (add_minutes) => new Promise(async(resolve, reject) => {
    try {

        const item = COUNTER_KEY_FOR_CHECK_TIME[add_minutes]
        if (!item) {
            return reject(`minutes invalid - ${add_minutes}`)
        }

        const { name, exp_time } = item

        //if current_time > exp_time > cannot create order or stop order
        const duration_stringify = await redis_db.getAsync(CACHE_SOCKET_COUNTER)
            // console.log({duration_stringify})
        const current_time = JSON.parse(duration_stringify)[name]
        if (current_time < exp_time) {
            // return reject(`expire time for create or close order ${current_time} < ${exp_time}`)
            return reject(`Hết thời gian để thực hiện thao tác: ${current_time} < ${exp_time}`)
        }

        return resolve(true)

    } catch (error) {
        console.log(error)
        return reject(error)
    }
})