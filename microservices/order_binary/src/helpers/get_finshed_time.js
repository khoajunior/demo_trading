const {COUNTER_KEY_FOR_CHECK_TIME, CACHE_SOCKET_COUNTER} = require('../../constants/constants')
const {redis_db} = require('../core/redis_db')


module.exports = (exp_time) => new Promise(async (resolve, reject) => {
  try{
    const server_time = await redis_db.getAsync(CACHE_SOCKET_COUNTER)

    const counter_time = JSON.parse(server_time)
    // console.log({counter_time})

    const end_time = counter_time.end_time[exp_time]

    if(!end_time){
      return reject('not found end time')
    }
    return resolve(end_time)

  }catch(error){
    console.log(error)
    return reject(error)
  }
})