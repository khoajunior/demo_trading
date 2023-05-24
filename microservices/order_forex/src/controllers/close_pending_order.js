const stop_order_pending = require('../services/stop_order_pending')
const message_broker = require('../core/message_broker')
const { EXCHANGE_LOGIC_SERVICE, PRICE_OBJECT, EXCHANGE_HANDLE_ORDER_SOCKET_CLIENT } = require('../../constants/constants')
const check_validate_tournament = require('../services/check_validate_tournament')
const check_market_status = require('../helpers/check_market_status')
const ACTION = `Đóng lệnh không thành công`

//Input: tournament_id,id of order
module.exports = async(req, res) => {
    try {
        const session_variables = req.body.session_variables
        const user_id = session_variables['x-hasura-user-id']
        const item = req.body.input
        item.user_id = user_id

        const { product_type, tournament_id } = item

        //Check market status
        const price_type = PRICE_OBJECT[product_type]
        const market_status = await check_market_status(price_type)
        if (!market_status) {
            return res.status(400).json({
                code: `market_closed`,
                message: `${ACTION}: thị trường đã đóng`
            })
        }
        
        //Check validate tournament
        const variables = {
            tournament_id_list: [tournament_id],
            product_type
        }
        const validate_tournaments = await check_validate_tournament(variables)
        if (validate_tournaments.length == 0) {
            return res.status(400).json({
                code: `tournament_invalid|quantity_too_low`,
                message: `${ACTION}: số tiền đặt quá thấp hoặc tournament không phù hợp`
            })
        }

        //close
        const order = await stop_order_pending(item)

        const pubChannel = message_broker.getPublishChannel()
        // remove order from redis (pending-active handle)
        pubChannel.publish(EXCHANGE_LOGIC_SERVICE,
            'data.pending-active-order.removing',
            Buffer.from(JSON.stringify({
                order_list: [order],
                price_type,
            }))
        )

        pubChannel.publish(EXCHANGE_HANDLE_ORDER_SOCKET_CLIENT, 
            'data.order.pending',
            Buffer.from(JSON.stringify({
                key_list: [`${price_type}/${user_id}/${tournament_id}`]
            }))
        )

        return res.json({ status: 200, message: 'Handle success', data: order })
    } catch (err) {
        console.error(err)
        if (err.message) {
            err = err.message
        }
        return res.status(400).json({
            code: `handle_fail`,
            message: `${ACTION}: ${err}`
        })
    }
}