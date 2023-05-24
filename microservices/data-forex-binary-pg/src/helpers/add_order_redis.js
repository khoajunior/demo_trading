const { redis_db } = require('../core/redis_db')

module.exports = (key, order_id, order) => new Promise(async(resolve, reject) => {
    try {
        await redis_db.hmsetAsync(key, order_id, order)

        const order_list = await redis_db.hmgetAsync(key)

        console.log(`After add order to redis`)

        return resolve(order_list)

    } catch (error) {
        console.log(error)
        return reject(error)
    }
})