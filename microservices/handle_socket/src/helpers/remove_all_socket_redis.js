const { redis_db } = require('../core/redis_db')
const { NAME_SPACE_SOCKET, PICE_SERVER_NAME } = require('../../constants/constants')

module.exports = async() => new Promise(async(resolve, reject) => {
    console.log(`remove all socket `)
    try {
        await redis_db.delAsync(`${PICE_SERVER_NAME}-${NAME_SPACE_SOCKET}`)

        const socket_list = await redis_db.hmgetAsync(`${PICE_SERVER_NAME}-${NAME_SPACE_SOCKET}`)
       
        return resolve(socket_list)
    } catch (error) {
        console.log("err in delete socket redis: ", error)
        return reject(error)
    }
})