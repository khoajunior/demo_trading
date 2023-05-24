const { redis_db } = require('../core/redis_db')
const { NAME_SPACE_SOCKET } = require('../../constants/constants')

module.exports = async(socket_id) => new Promise(async(resolve, reject) => {
    try {
        await redis_db.delAsync(NAME_SPACE_SOCKET, socket_id)

        const socket_list = await redis_db.getAsync(NAME_SPACE_SOCKET)

        return resolve(socket_list)
    } catch (error) {
        console.log(error)
        return reject(error)
    }
})