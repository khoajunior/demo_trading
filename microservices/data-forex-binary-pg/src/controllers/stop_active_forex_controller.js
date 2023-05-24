const trade_forex_pg = require('../services/trade_forex_pg')
const message_broker = require('../core/message_broker')
const { EXCHANGE_LOGIC_SERVICE, EXCHANGE_HANDLE_ORDER_SOCKET_CLIENT } = require('../../constants/constants')
const filter_user_tournament_unique = require('../helpers/filter_user_tournament_unique')
const update_demo_account_with_closed_order = require('../services/update_demo_account_with_closed_order')
const filter_user_tournament_socket_client = require('../helpers/filter_user_tournament_socket_client')

// count_id not id because saving in zadd
module.exports = async (message) => {
    console.log(`stop order pg--------------------------`)
    try {
        const pubChannel = message_broker.getPublishChannel()
        const result = await trade_forex_pg.stop_order(message)

        if (result.length > 0) {

            const user_tournament_list = filter_user_tournament_unique(result)
            const {price_type} = message

            await update_demo_account_with_closed_order(user_tournament_list)
            pubChannel.publish(EXCHANGE_LOGIC_SERVICE,
                'data.handling-margin.order',
                Buffer.from(JSON.stringify({ 
                    user_tournament_list, 
                    price_type 
                }))
            )

            const user_tournament_socket_client_list = filter_user_tournament_socket_client(result, price_type)
            pubChannel.publish(EXCHANGE_HANDLE_ORDER_SOCKET_CLIENT, 
                'data.order.active',
                Buffer.from(JSON.stringify({
                    key_list: user_tournament_socket_client_list
                }))
            )
        }



    } catch (error) {
        console.log(error)
    }
}