const { redis_db } = require('../core/redis_db')

module.exports = async(key, order_id) => new Promise(async(resolve, reject) => {
    try {
        await redis_db.hmdelAsync(key, order_id)

        const order_list = await redis_db.hmgetAsync(key)

        console.log(`After remove order in redis`)

        return resolve(order_list)

    } catch (error) {
        console.log(error)
        return reject(error)
    }
})