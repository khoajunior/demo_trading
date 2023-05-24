const {remove_order_from_redis} = require('../services/handle_pending_active')

module.exports = (order_item, has_override_status = false) => new Promise(async (resolve, reject) => {
    try{
        console.log('remove order active and pending from redis')
        await remove_order_from_redis(order_item, has_override_status)
        return resolve(true)

    }catch(error){
        console.log(error)
        return resolve(false)
    }
})