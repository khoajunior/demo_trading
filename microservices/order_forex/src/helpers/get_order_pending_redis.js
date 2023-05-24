const { redis_db } = require('../core/redis_db')
const { HANDLE_PENDING_ORDER_FOREX } = require('../../constants/constants')

module.exports = async() => {
    console.log(`get all order pending---------------------------------`)
    try {
        const list_order_pending = await redis_db.hmgetAsync(HANDLE_PENDING_ORDER_FOREX)
        return list_order_pending

    } catch (error) {
        return null
    }
}