const { redis_db } = require('../core/redis_db')

module.exports = async (asset, price_type = 'forex') => {
    console.log('Get current price')
    try {
        const price = await redis_db.hmgetAsync(`${price_type}_group`)
        const current_price =  JSON.parse(price[asset])

        return current_price
    } catch (error) {
        console.log(`In function get current price`, error)
        return null
    }

}