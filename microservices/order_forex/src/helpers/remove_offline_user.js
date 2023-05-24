const { redis_db } = require('../core/redis_db')
const { ONLINE_USER_LIST } = require('../../constants/constants')

module.exports = async(key, socket_id) => new Promise(async(resolve, reject) => {
    try {

        await redis_db.hmdelAsync(key, socket_id)

        await redis_db.hmdelAsync(ONLINE_USER_LIST, socket_id)

        const user_list = await redis_db.hmgetAsync(key)

        // console.log({remove_offline_user: user_list})
        return resolve(user_list)

    } catch (error) {
        console.log(error)
        return reject(error)

    }
})