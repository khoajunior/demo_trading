const { redis_db } = require('../core/redis_db')

module.exports = async(price_type = 'forex') => {
    try {
        // console.log({price_type})
        const price_detail = await redis_db.hmgetAsync(`${price_type}_group`)

        return price_detail

    } catch (error) {
        return null
    }
}