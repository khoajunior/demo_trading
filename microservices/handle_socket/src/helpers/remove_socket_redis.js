const { redis_db } = require('../core/redis_db')
const { NAME_SPACE_SOCKET, PICE_SERVER_NAME } = require('../../constants/constants')

module.exports = async(socket_id) => new Promise(async(resolve, reject) => {
    console.log(`remove sokcet: `, socket_id)
    try {
        await redis_db.hmdelAsync(`${PICE_SERVER_NAME}-${NAME_SPACE_SOCKET}`, socket_id)

        // const socket_list = await redis_db.hmgetAsync(`${PICE_SERVER_NAME}-${NAME_SPACE_SOCKET}`)
        // console.log(`list socket sau khi xóa: `, socket_list)

        return resolve(true)
    } catch (error) {
        console.log("err in delete socket redis: ", error)
        return reject(error)
    }
})