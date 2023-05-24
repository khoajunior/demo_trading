const get_current_price = require('../helpers/get_current_price')
const create_order = require('../services/create_order')
const { TYPE_BUY } = require('../../constants/constants')
const { STATUS_ACTIVE, EXCHANGE_LOGIC_SERVICE, PRICE_OBJECT, EXCHANGE_HANDLE_ORDER_SOCKET_CLIENT } = require('../../constants/constants')
const message_broker = require('../core/message_broker')
const check_validate_tournament = require('../services/check_validate_tournament')
const check_market_status = require('../helpers/check_market_status')
const ACTION = `Tạo lệnh không thành công`
const check_count_order = require('../services/check_count_order')

var ip = require("ip");


//Input: tournament_id,asset,type,quantity,leverage,take_profit,stop_loss,pending_price
module.exports = async(req, res) => {
    try {
        const item = req.body.input
        const session_variables = req.body.session_variables
        const user_id = session_variables['x-hasura-user-id']
        item.user_id = user_id

        //Lấy địa chỉ id của req
        item.ip = ip.address()

        const { product_type, tournament_id, price_object, asset, quantity} = item

        //Check user có vượt quá số lượng lệnh được đặt không
        await check_count_order({tournament_id,user_id})

        //Check market status
        const price_type = PRICE_OBJECT[product_type]
        const market_status = await check_market_status(price_type)
        if (!market_status) {
            return res.status(400).json({
                code: `market_closed`,
                message: `${ACTION}: thị trường đã đóng`
            })
        }

        //Get current price + set open_price
        const price = await get_current_price(asset, price_type)
        if (!price) {
            return res.status(400).json({
                code: `cannot_get_current_price`,
                message: `${ACTION}: không lấy được tỉ giá`
            })
        }
        item.open_price = price.bid
        if (item.type == TYPE_BUY) {
            item.open_price = price.ask
        }

        //Check tournament validate
        const variables = {
            tournament_id_list: [tournament_id],
            quantity: item.quantity,
            product_type,
        }
        const check_min_amount = true
        const check_max_amount = true
        const validate_tournaments = await check_validate_tournament(variables, check_min_amount, check_max_amount)
        if (validate_tournaments.length == 0) {
            return res.status(400).json({
                code: `tournament_invalid|quantity_range`,
                message: `${ACTION}: số tiền đặt lệnh hoặc tournament không phù hợp`
            })
        }

        //Create order
        item.price_type = price_type
        const created_order = await create_order(item)

        const pubChannel = message_broker.getPublishChannel()
        // add order to redis (pending-active handle)
        pubChannel.publish(EXCHANGE_LOGIC_SERVICE,
            'data.pending-active-order.adding',
            Buffer.from(JSON.stringify({
                order_list: [created_order],
                price_type,
            }))
        )

        const user_tournament_list = [{
            tournament_id,
            user_id
        }]

        if (created_order.status == STATUS_ACTIVE) {
            // update margin to redis (handle margin level)
            pubChannel.publish(EXCHANGE_LOGIC_SERVICE,
                'data.handling-margin.order',
                Buffer.from(JSON.stringify({
                    user_tournament_list,
                    price_type,
                    check_user_info: true
                }))
            )
        }

        var queue_name = 'data.order.active'
        if (item.pending_price) {
            queue_name  = 'data.order.pending'
        }

        pubChannel.publish(EXCHANGE_HANDLE_ORDER_SOCKET_CLIENT, 
            queue_name,
            Buffer.from(JSON.stringify({
                key_list: [`${price_type}/${user_id}/${tournament_id}`]
            }))
        )


        return res.json({ status: 200, message: 'Handle success', data: created_order })
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