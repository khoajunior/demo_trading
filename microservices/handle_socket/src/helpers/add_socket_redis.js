const { redis_db } = require('../core/redis_db')
const { NAME_SPACE_SOCKET, PICE_SERVER_NAME} = require('../../constants/constants')

module.exports = (socket_id) => new Promise(async(resolve, reject) => {
    console.log(`add sokcet: `, socket_id)
    try {
        const time = new Date().getTime()
        await redis_db.hmsetAsync(`${PICE_SERVER_NAME}-${NAME_SPACE_SOCKET}`, socket_id, time)

        // const socket_list = await redis_db.hmgetAsync(NAME_SPACE_SOCKET)
        return resolve(true)
    } catch (error) {
        console.log("err in add socket redis: ", error)
        return reject(error)
    }
})