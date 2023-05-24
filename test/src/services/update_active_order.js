const { socket_client } = require('../core/socket_client')
const { EMIT_UPDATE_ACTIVE_ORDER, EMIT_GET_ORDER_LIST } = require('../../constants/constants')
const { v4: uuid } = require('uuid')

//item: id of order,stop_loss,take_profit(new)
module.exports = (item) => new Promise(async(resolve, reject) => {
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

        const input = item || {
            request_id: uuid(),
            id: 258,
            // 1.18972
            stop_loss: 1.18972 - 0.0004,
            take_profit: 1.21288 + 0.0004
        }

        socket_forex.emit(EMIT_UPDATE_ACTIVE_ORDER, input)

        listen_data(socket_forex, socket_active_forex, 'main')

        listen_data(socket_forex_1, socket_active_forex_1, 'active sub 1')

        listen_data(socket_forex_2, socket_active_forex_2, 'active sub 2')

        listen_data(socket_forex_3, socket_active_forex_3, 'active sub 3')

        // listen_data(socket_forex_1, socket_pending_forex_1, 'pending sub 1')

        // listen_data(socket_forex_2, socket_pending_forex_2, 'pending sub 2')

        // listen_data(socket_forex_3, socket_pending_forex_3, 'pending sub 3')

        return resolve(true)
    } catch (err) {
        console.log(`Error in test/service: ` + err)
        return reject(err)
    }
})

const listen_data = (socket, socket_active, type) => {

    socket.on(EMIT_UPDATE_ACTIVE_ORDER, data => {
        console.log("data of socket forex " + type, data)
    });


    socket_active.on(EMIT_GET_ORDER_LIST, order_list => {
        console.log("data order_list of socket " + type, order_list)
    })
}