const { socket_client } = require('../core/socket_client')
const { EMIT_UPDATE_PENDING_ORDER, EMIT_GET_ORDER_LIST } = require('../../constants/constants')
const { v4: uuid } = require('uuid')

//item: id of order,pending_price(new pending price)
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

        const input = item || {
            // user_id: '89ee7087-95f4-4e3b-9ee4-e0b14b4f0d6e',
            request_id: uuid(),
            id: 271,
            pending_price: 11,
            //1.18972
            take_profit: 14,
            stop_loss: 10
        }

        socket_forex.emit(EMIT_UPDATE_PENDING_ORDER, input)

        listen_data(socket_forex, socket_pending_forex, 'main')

        listen_data(socket_forex_1, socket_pending_forex_1, 'pending sub 1')

        listen_data(socket_forex_2, socket_pending_forex_2, 'pending sub 2')

        listen_data(socket_forex_3, socket_pending_forex_3, 'pending sub 3')

        return resolve(true)
    } catch (err) {
        console.log(`Error in test/service/update_pending_order: ` + err)
        return reject(err)
    }
})

const listen_data = (socket, socket_active, type) => {

    socket.on(EMIT_UPDATE_PENDING_ORDER, data => {
        console.log("data of socket forex " + type, data)
    });


    socket_active.on(EMIT_GET_ORDER_LIST, order_list => {
        console.log("data order_list of socket forex-pending " + type, order_list)
    })
}