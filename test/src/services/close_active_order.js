const { socket_client } = require('../core/socket_client')
const { EMIT_CLOSE_ACTIVE_ORDER, EMIT_GET_ORDER_LIST } = require('../../constants/constants')
const { v4: uuid } = require('uuid')

//item: id(of order)
module.exports = (item) => new Promise(async(resolve, reject) => {
    console.log(`test auto close active order`)
    try {
        const socket_forex = socket_client.forex
        const socket_forex_1 = socket_client.forex_sub_1
        const socket_forex_2 = socket_client.forex_sub_2
        const socket_forex_3 = socket_client.forex_sub_3

        const socket_active_forex = socket_client.active_forex
        const socket_active_forex_1 = socket_client.active_forex_sub_1
        const socket_active_forex_2 = socket_client.active_forex_sub_2
        const socket_active_forex_3 = socket_client.active_forex_sub_3

        //send input to EMIT_CLOSE_ACTIVE_ORDER
        const input = item || {
            request_id: uuid(),
            id: 338 //344,348->360
        }
        socket_forex.emit(EMIT_CLOSE_ACTIVE_ORDER, input)

        listen_data(socket_forex, socket_active_forex, 'main')

        listen_data(socket_forex_1, socket_active_forex_1, 'sub 1')

        listen_data(socket_forex_2, socket_active_forex_2, 'sub 2')

        listen_data(socket_forex_3, socket_active_forex_3, 'sub 3')

        return resolve(true)
    } catch (err) {
        console.log(`Error in test/service/close_active_order_list: ` + err)
        return reject(err)
    }
})

const listen_data = (socket, socket_active, type) => {

    socket.on(EMIT_CLOSE_ACTIVE_ORDER, data => {
        console.log("data of socket forex " + type, data)
    });


    socket_active.on(EMIT_GET_ORDER_LIST, order_list => {
        console.log("data order_list of socket forex-active " + type, order_list)
    })
}