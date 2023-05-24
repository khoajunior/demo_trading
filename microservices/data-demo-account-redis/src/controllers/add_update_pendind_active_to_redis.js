const {save_or_update_order_to_redis} = require('../services/handle_pending_active')


module.exports = async (order_item, has_override_status = false, redis_type) => new Promise(async (resolve, reject) =>{
    try{
        console.log("save order or update order to redis handling pending and active")
        await save_or_update_order_to_redis(order_item, has_override_status, redis_type)
        return resolve(true)
    }catch(error){
        console.log(error)
        return resolve(false)
    }
})