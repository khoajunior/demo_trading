const { redis_db } = require('../core/redis_db')
const { NAME_SPACE_SOCKET, PICE_SERVER_NAME } = require('../../constants/constants')


const get_socket_redis = () => new Promise(async (resolve, reject) => {
    console.log(`getlist socket in redis`)
    try {
        const socket_list = await redis_db.hmgetAsync(`${PICE_SERVER_NAME}-${NAME_SPACE_SOCKET}`)
        return resolve(socket_list)
    } catch (error) {
        console.log("err in get socket redis: ", error)
        return null
    }
})

const save_socket_redis = (socket_id, value) => new Promise(async (resolve, reject) => {
    console.log(`getlist socket in redis`)
    try {
        await redis_db.hmsetAsync(`${PICE_SERVER_NAME}-${NAME_SPACE_SOCKET}`, socket_id, value)
        return resolve(true)
    } catch (error) {
        console.log("err in get socket redis: ", error)
        return null
    }
})

const get_unique_socket_list = () => new Promise(async (resolve, reject) => {
    try{
  
      const result = await redis_db.hmgetAsync(`${PICE_SERVER_NAME}-${NAME_SPACE_SOCKET}`)
      if(!result){
        return resolve([])
      }
  
      const asset_list = Object.values(result)
      const unique_asset_list = new Set(asset_list)
  
      return resolve([...unique_asset_list])
  
    }catch(error){
      // console.log(error)
      return reject(error)
    }
  })

module.exports = {
    get_socket_redis,
    save_socket_redis,
    get_unique_socket_list
}