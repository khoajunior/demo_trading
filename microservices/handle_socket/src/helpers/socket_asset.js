const { redis_db } = require('../core/redis_db')
const { CACHE_SOCKET_ASSET, PICE_SERVER_NAME } = require('../../constants/constants')


const save_socket_asset = (socket_id, asset) => new Promise(async (resolve, reject) => {
  try {

    await redis_db.hmsetAsync(`${PICE_SERVER_NAME}-${CACHE_SOCKET_ASSET}`, socket_id, asset)

    // const result = await redis_db.hmgetAsync(CACHE_SOCKET_ASSET)
    // console.log({result})
    return resolve(true)

  } catch (error) {
    console.log(error)
    return resolve(false)
  }
})

const remove_socket_asset = (socket_id) => new Promise(async (resolve, reject) => {
  try {
    // console.log({remove_socket_asset: socket_id})

    await redis_db.hmdelAsync(`${PICE_SERVER_NAME}-${CACHE_SOCKET_ASSET}`, socket_id)

    // const result = await redis_db.hmgetAsync(`${PICE_SERVER_NAME}-${CACHE_SOCKET_ASSET}`)
    // console.log({"list socket sau khi xoa listen asset" : result})
    return resolve(true)


  } catch (error) {
    console.log(error)
    return resolve(false)
  }
})

const get_unique_asset_list = () => new Promise(async (resolve, reject) => {
  try{

    const result = await redis_db.hmgetAsync(`${PICE_SERVER_NAME}-${CACHE_SOCKET_ASSET}`)
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

const remove_all_socket_asset = async () => {
  try{
    await redis_db.delAsync(`${PICE_SERVER_NAME}-${CACHE_SOCKET_ASSET}`)
  }catch(error){
    console.log(error)
  }
}

module.exports = {
  save_socket_asset,
  remove_socket_asset,
  get_unique_asset_list,
  remove_all_socket_asset
}
