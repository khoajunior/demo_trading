const { STATUS_PENDING, EXCHANGE_LOGIC_SERVICE, PRICE_OBJECT, EXCHANGE_HANDLE_ORDER_SOCKET_CLIENT } = require('../../constants/constants')
const get_list_order = require('../services/get_list_order')
const { check_valid_tp_sl, get_transaction_type } = require('../services/support_handler')
const update_pending = require('../services/update_pending')
const messageBroker = require('../core/message_broker')
const check_validate_tournament = require('../services/check_validate_tournament')
const check_market_status = require('../helpers/check_market_status')
const ACTION = `Cập nhật lệnh đang chờ không thành công`

//Input: tournament_id,id(id of order),stop_loss,take_profit,pending_price
module.exports = async (req, res) => {
    const session_variables = req.body.session_variables
    const user_id = session_variables['x-hasura-user-id']
    const item = req.body.input
    item.user_id = user_id
    item.status = STATUS_PENDING

    const { product_type, tournament_id } = item

    //check market status
    const price_type = PRICE_OBJECT[product_type]
    const pubChannel = messageBroker.getPublishChannel()
    try {

        const market_status = await check_market_status(price_type)
        if (!market_status) {
            return res.status(400).json({
                code: `market_closed`,
                message: `${ACTION}: thị trường đã đóng`
            })
        }

        //check validate tournament
        const variables = {
            tournament_id_list: [tournament_id],
            product_type
        }
        const validate_tournaments = await check_validate_tournament(variables)
        if (validate_tournaments.length == 0) {

            pubChannel.publish(EXCHANGE_HANDLE_ORDER_SOCKET_CLIENT,
                'data.order.pending',
                Buffer.from(JSON.stringify({
                    key_list: [`${price_type}/${user_id}/${tournament_id}`]
                }))
            )
            return res.status(400).json({
                code: `tournament_invalid|quantity_too_low`,
                message: `${ACTION}: số tiền đặt quá thấp hoặc tournament không phù hợp`
            })
        }

        //Get order
        const pre_order_list = await get_list_order(item)
        const { pending_price, type, open_price, quantity, asset, stop_loss, take_profit } = pre_order_list[0]

        //user update 0 meanding delete stop_loss or take profit
        if (item.stop_loss == null || item.stop_loss == undefined) {
            item.stop_loss = stop_loss
        }
        if (item.stop_loss == 0) {
            item.stop_loss = null
        }

        if (item.take_profit == null || item.take_profit == undefined) {
            item.take_profit = take_profit || null
        }

        if (item.take_profit == 0) {
            item.take_profit = null
        }

        var new_pending_price = item.pending_price || pending_price
        await check_valid_tp_sl(item.stop_loss, item.take_profit, new_pending_price, type, asset, price_type)

        //Get type of pending
        const transaction_type = get_transaction_type(new_pending_price, open_price, type)

        item.transaction_type = transaction_type
        item.pending_price = new_pending_price
        item.quantity = item.quantity || quantity

        const order = await update_pending(item)

        // update order to redis (pending-active handle)
        pubChannel.publish(EXCHANGE_LOGIC_SERVICE,
            'data.pending-active-order.updating',
            Buffer.from(JSON.stringify({
                pre_order_list,
                updated_order_list: [order],
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
        pubChannel.publish(EXCHANGE_HANDLE_ORDER_SOCKET_CLIENT,
            'data.order.pending',
            Buffer.from(JSON.stringify({
                key_list: [`${price_type}/${user_id}/${tournament_id}`]
            }))
        )
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