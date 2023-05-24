const { socket_client } = require('../core/socket_client')
const { EMIT_CLOSE_PENDING_ORDER, EMIT_GET_ORDER_LIST } = require('../../constants/constants')
const { v4: uuid } = require('uuid')

//item: id order
module.exports = (item) => new Promise(async(resolve, reject) => {
    try {
        const socket_forex = socket_client.forex
        const socket_forex_1 = socket_client.forex_sub_1
        const socket_forex_2 = socket_client.forex_sub_2
        const socket_forex_3 = socket_client.forex_sub_3

        const socket_pending_forex = socket_client.pending_forex
        const socket_pending_forex_1 = socket_client.pending_forex_sub_1
        const socket_pending_forex_2 = socket_client.pending_forex_sub_2
        const socket_pending_forex_3 = socket_client.pending_forex_sub_3

        //send input to EMIT_CLOSE_PENDING_ORDER
        const input = item || {
            request_id: uuid(),
            id: 393 //341->343
        }
        socket_forex.emit(EMIT_CLOSE_PENDING_ORDER, input)

        listen_data(socket_forex, socket_pending_forex, 'main')

        listen_data(socket_forex_1, socket_pending_forex_1, 'sub 1')

        listen_data(socket_forex_2, socket_pending_forex_2, 'sub 2')

        listen_data(socket_forex_3, socket_pending_forex_3, 'sub 3')

        return resolve(true)
    } catch (err) {
        console.log(`Error in test/service/close_active_order_list: ` + err)
        return reject(err)
    }
})

const listen_data = (socket, socket_active, type) => {

    socket.on(EMIT_CLOSE_PENDING_ORDER, data => {
        console.log("data of socket forex " + type, data)
    });


    socket_active.on(EMIT_GET_ORDER_LIST, order_list => {
        console.log("data order_list of socket forex-pending " + type, order_list)
    })
}