const {socket_client}= require('../core/socket_client')
const {EMIT_CREATE_ORDER, EMIT_GET_ORDER_LIST} = require('../../constants/constants')
const {v4: uuid} = require(uuid)

module.exports = (item = null) => new Promise((resolve, reject) => {
    try{
        const socket_forex = socket_client.forex
        const socket_active_forex = socket_client.active_forex

        const result = {}

        const order = item || {
            asset: 'EURUSD', 
            request_id: uuid(), 
            quantity: 3, 
            leverage: 500
        }
        socket_forex.emit(EMIT_CREATE_ORDER, order)


        socket_forex.on(EMIT_CREATE_ORDER, data => {
            result[EMIT_CREATE_ORDER] = data
        })

        socket_active_forex.on(EMIT_GET_ORDER_LIST, order_list => {
            result[EMIT_GET_ORDER_LIST] = order_list
        })
        return resolve(result)

    }catch(error){
        console.log(error)
        return reject({"create order failure": error})
    }
})