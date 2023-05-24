const { redis_db } = require('../core/redis_db')
const { ONLINE_USER_LIST } = require('../../constants/constants')

module.exports = (key, socket_id, user_id) => new Promise(async(resolve, reject) => {
    try {
        await redis_db.hmsetAsync(key, socket_id, user_id)

        await redis_db.hmsetAsync(ONLINE_USER_LIST, socket_id, user_id)

        const user_list = await redis_db.hmgetAsync(key)

        console.log({ key, add_online_user: user_list })
        return resolve(user_list)

    } catch (error) {
        console.log(error)
        return reject(error)

    }
})