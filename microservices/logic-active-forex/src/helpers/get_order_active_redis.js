const { redis_db } = require('../core/redis_db')
const { HANDLE_ACTIVE_ORDER_FOREX } = require('../../constants/constants')

module.exports = async() => {
    console.log(`get all order active---------------------------------`)
    try {
        const list_order_active = await redis_db.hmgetAsync(HANDLE_ACTIVE_ORDER_FOREX)

        return list_order_active

    } catch (error) {
        return null
    }
}