const trade_forex_pg = require('../services/trade_forex_pg')
const messageBroker = require('../core/message_broker')
const { EXCHANGE_LOGIC_SERVICE, EXCHANGE_HANDLE_ORDER_SOCKET_CLIENT } = require('../../constants/constants')
const filter_user_tournament_socket_client = require('../helpers/filter_user_tournament_socket_client')


// when margin level < 50%
module.exports = async (message) => {
    console.log('Controller stop pending list')
    try {
        const pubChannel = messageBroker.getPublishChannel()
        const result = await trade_forex_pg.stop_order_pending_list(message)

        if (result.length > 0) {
            const {price_type} = message

            // remove order pending from redis (pending-active handle)
            pubChannel.publish(EXCHANGE_LOGIC_SERVICE,
                'data.pending-active-order.removing',
                Buffer.from(JSON.stringify({
                    order_list: result,
                    price_type: message.price_type
                }))
            )


            const user_tournament_socket_client_list = filter_user_tournament_socket_client(result, price_type)

            pubChannel.publish(EXCHANGE_HANDLE_ORDER_SOCKET_CLIENT, 
                'data.order.pending',
                Buffer.from(JSON.stringify({
                    key_list: user_tournament_socket_client_list
                }))
            )
        }


    } catch (error) {
        console.log(error)
    }
}