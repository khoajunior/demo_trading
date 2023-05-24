const { socket_client } = require('../core/socket_client')
const { EMIT_GET_ORDER_LIST, STATUS_ACTIVE, STATUS_PENDING } = require('../../constants/constants')
const { v4: uuid } = require('uuid')

//item: start_day,end_day,sort_by,sort_direction,page_size,current_page,status
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
            // status: [STATUS_PENDING, STATUS_ACTIVE],
            // start_day: '2020-01-01',
            // end_day: '2030-01-01',
            // sort_by: 'id',
            // sort_direction: 'asc',
            // page_size: 50,
            // current_page: 0
        }

        socket_forex.emit(EMIT_GET_ORDER_LIST, input)

        listen_data(socket_forex, socket_pending_forex, 'main')

        listen_data(socket_forex_1, socket_active_forex_1, 'active sub 1')

        listen_data(socket_forex_2, socket_active_forex_2, 'active sub 2')

        listen_data(socket_forex_3, socket_active_forex_3, 'active sub 3')

        listen_data(socket_forex_1, socket_pending_forex_1, 'pending sub 1')

        listen_data(socket_forex_2, socket_pending_forex_2, 'pending sub 2')

        listen_data(socket_forex_3, socket_pending_forex_3, 'pending sub 3')

        return resolve(true)
    } catch (err) {
        console.log(`Error in test/service/EMIT_CLOSE_PENDING_ORDER_LIST: ` + err)
        return reject(err)
    }
})

const listen_data = (socket, socket_active, type) => {

    socket.on(EMIT_GET_ORDER_LIST, data => {
        console.log("data of socket forex " + type, data)
    });


    socket_active.on(EMIT_GET_ORDER_LIST, order_list => {
        console.log("data order_list of socket forex-pending " + type, order_list)
    })
}