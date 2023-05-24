const { socket_client } = require('../core/socket_client')
const { EMIT_CREATE_ORDER, EMIT_GET_ORDER_LIST } = require('../../constants/constants')
const { v4: uuid } = require('uuid')

//TODO: -> bất đồng bộ
module.exports = (item = null) => new Promise(async(resolve, reject) => {
    console.log(`test create forex  order`)
    try {

        const socket_forex = socket_client.forex
        const socket_forex_1 = socket_client.forex_sub_1
        const socket_forex_2 = socket_client.forex_sub_2
        const socket_forex_3 = socket_client.forex_sub_3

        const socket_active_forex = socket_client.active_forex
        const socket_active_forex_1 = socket_client.active_forex_sub_1
        const socket_active_forex_2 = socket_client.active_forex_sub_2
        const socket_active_forex_3 = socket_client.active_forex_sub_3

        const socket_pending_forex = socket_client.pending_forex
        const socket_pending_forex_1 = socket_client.pending_forex_sub_1
        const socket_pending_forex_2 = socket_client.pending_forex_sub_2
        const socket_pending_forex_3 = socket_client.pending_forex_sub_3

        const order = item || {
            asset: 'USD/CAD',
            // pending_price: 11.5,
            request_id: uuid(),
            quantity: 5,
            leverage: 600
        }
        socket_forex.emit(EMIT_CREATE_ORDER, order)


        listen_data(socket_forex, socket_active_forex, 'main')

        listen_data(socket_forex_1, socket_active_forex_1, 'active sub 1')

        listen_data(socket_forex_2, socket_active_forex_2, 'active sub 2')

        listen_data(socket_forex_3, socket_active_forex_3, 'active sub 3')

        listen_data(socket_forex_1, socket_pending_forex_1, 'pending sub 1')

        listen_data(socket_forex_2, socket_pending_forex_2, 'pending sub 2')

        listen_data(socket_forex_3, socket_pending_forex_3, 'pending sub 3')

        return resolve(true)

    } catch (error) {
        console.log("Error in Create order" + error)
        return reject(error)
    }
})

const listen_data = (socket, socket_active, type) => {

    socket.on(EMIT_CREATE_ORDER, data => {
        console.log("data of socket forex " + type, data)
    });


    socket_active.on(EMIT_GET_ORDER_LIST, order_list => {
        console.log("data order_list of socket forex " + type, order_list)
    })
}