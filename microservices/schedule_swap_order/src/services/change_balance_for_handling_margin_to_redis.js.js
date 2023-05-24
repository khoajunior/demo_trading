const { redis_db } = require('../core/redis_db')
const { HANDLE_MARGIN_LEVEL } = require('../../constants/constants')


// because binary only change balance => only update balance to redis
module.exports = (margin_item) => new Promise(async (resolve, reject) => {
    try {
        const { user_id, tournament_id, balance, price_type } = margin_item
        const key = `${price_type}_${HANDLE_MARGIN_LEVEL}`
        const demo_account_redis = await redis_db.hmgetAsync(key)

        if (!demo_account_redis) {
            return resolve('not thing to update handle margin level')
        }


        //save all order follow tournament_id and user_id
        const score = `${tournament_id}/${user_id}`

        if (!demo_account_redis[score]) {
            return resolve('not thing to update handle margin level')
        }
        const detail = {
            total_balance: balance,
            total_margin: demo_account_redis[score].total_margin,
            order_list: demo_account_redis[score].order_list
        }
        await redis_db.hmsetAsync(key, score, JSON.stringify(detail))


        return resolve(true)

    } catch (error) {
        console.log(error)
        return resolve(false)
    }
})