const stop_order = require('../services/stop_order')
const {
    TYPE_BUY, STATUS_ACTIVE, EXCHANGE_LOGIC_SERVICE,
    PRICE_OBJECT, MIN_TIME_CLOSE_ORDER, EXCHANGE_HANDLE_ORDER_SOCKET_CLIENT
} = require('../../constants/constants')
const get_list_order = require('../services/get_list_order')
const message_broker = require('../core/message_broker')
const check_validate_tournament = require('../services/check_validate_tournament')
const check_market_status = require('../helpers/check_market_status')
const ACTION = `Đóng lệnh không thành công`
const get_all_current_price = require('../helpers/get_all_current_price')
const update_demo_account_with_closed_order = require('../services/update_demo_account_with_closed_order')

//Input: user_id,tournament_id,id of order
module.exports = async (req, res) => {
    try {
        const session_variables = req.body.session_variables
        const user_id = session_variables['x-hasura-user-id']
        const item = req.body.input
        item.user_id = user_id

        const { product_type, tournament_id } = item

        //check market status
        const price_type = PRICE_OBJECT[product_type]
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
            return res.status(400).json({
                code: `tournament_invalid|quantity_too_low|quantity_too_high`,
                message: `${ACTION}: số tiền đặt quá thấp, số tiền đặt quá cao hoặc tournament không phù hợp`
            })
        }

        //Get order in db
        item.status = STATUS_ACTIVE

        //dont close before 1 minute
        const min_time_order = new Date(new Date().getTime() - MIN_TIME_CLOSE_ORDER).toISOString()

        const pre_order = await get_list_order(item)
        const { open_price, fn_net_profit_loss, type, asset, start_time } = pre_order[0]

        if (start_time > min_time_order) {
            return res.status(400).json({
                code: `min_time_order`,
                message: `${ACTION}: Chưa đủ 60 giây để đóng lệnh`
            })
        }

        //Get close_price with asset of order
        var price_object = await get_all_current_price(price_type)
        const price = JSON.parse(price_object[asset])
        var close_price = price.ask
        if (type == TYPE_BUY) {
            close_price = price.bid
        }
        item.close_price = close_price
        item.net_profit_loss = fn_net_profit_loss * (close_price - open_price)
        item.gross_profit_loss = item.net_profit_loss

        //Stop order
        const stoped_order = await stop_order(item)

        await update_demo_account_with_closed_order({
            user_id,
            tournament_id
        })

        const pubChannel = message_broker.getPublishChannel()
        // remove active from redis (pending-active handle)
        pubChannel.publish(EXCHANGE_LOGIC_SERVICE,
            'data.pending-active-order.removing',
            Buffer.from(JSON.stringify({
                order_list: [stoped_order],
                price_type,
            }))
        )
        const user_tournament_list = [{
            user_id,
            tournament_id,
            price_type
        }]

        pubChannel.publish(EXCHANGE_LOGIC_SERVICE,
            'data.handling-margin.order',
            Buffer.from(JSON.stringify({
                user_tournament_list,
                price_type
            }))
        )

        pubChannel.publish(EXCHANGE_HANDLE_ORDER_SOCKET_CLIENT,
            'data.order.active',
            Buffer.from(JSON.stringify({
                key_list: [`${price_type}/${user_id}/${tournament_id}`]
            }))
        )

        return res.json({ status: 200, message: 'Handle success', data: stoped_order })
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