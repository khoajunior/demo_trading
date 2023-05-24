const trade_forex_pg = require('../services/trade_forex_pg')
const { EXCHANGE_LOGIC_SERVICE, EXCHANGE_HANDLE_ORDER_SOCKET_CLIENT} = require('../../constants/constants')
const message_broker = require('../core/message_broker')
const filter_user_tournament_unique = require('../helpers/filter_user_tournament_unique')
const filter_user_tournament_socket_client = require('../helpers/filter_user_tournament_socket_client')

module.exports = async (message) => {
    console.log(`update pending to active postgres`)
    try {
        const pubChannel = message_broker.getPublishChannel()

        // save per order to hasura.
        const {new_order_list:result, new_cancel_list} = await trade_forex_pg.update_pending_to_active(message)

        const notify_update_or_cancel_pending_order_list = [...result, ...new_cancel_list]
        const {price_type} = message

        if (result.length > 0) {

            // remove order pending and add acive to redis (pending-active handle)
            pubChannel.publish(EXCHANGE_LOGIC_SERVICE,
                'data.pending-change-to-active.order',
                Buffer.from(JSON.stringify({
                    order_list: result, 
                    price_type
                }))
            )

            const user_tournament_list = filter_user_tournament_unique(result)

            // update margin to redis (handle margin level)
            pubChannel.publish(EXCHANGE_LOGIC_SERVICE,
                'data.handling-margin.order',
                Buffer.from(JSON.stringify({
                    user_tournament_list,
                    price_type
                }))
            )
        }

        if(notify_update_or_cancel_pending_order_list.length > 0){
            const user_tournament_socket_client_list = filter_user_tournament_socket_client(notify_update_or_cancel_pending_order_list, price_type)

            pubChannel.publish(EXCHANGE_HANDLE_ORDER_SOCKET_CLIENT, 
                'data.order.pending-active',
                Buffer.from(JSON.stringify({
                    key_list: user_tournament_socket_client_list
                }))
            )   
        }

        if(new_cancel_list.length > 0){
            const cancel_user_tournament_list = filter_user_tournament_socket_client(new_cancel_list, price_type)

            pubChannel.publish(EXCHANGE_HANDLE_ORDER_SOCKET_CLIENT, 
                'data.order.pending-active-cancel',
                Buffer.from(JSON.stringify({
                    key_list: cancel_user_tournament_list
                }))
            )
        }

    } catch (error) {
        console.log(error)
    }
}