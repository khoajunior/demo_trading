const get_list = require('../services/get_list')
const get_all_current_price = require('../helpers/get_all_current_price')
const handler_hasura = require('../helpers/handler_hasura')
const check_time_for_order = require('../helpers/check_time_for_order')
const check_validate_tournament = require('../services/check_validate_tournament')
const { BINARY_CANCEL_STATUS, PRICE_OBJECT } = require('../../constants/constants')
const message_broker = require('../core/message_broker')
const check_market_status = require('../helpers/check_market_status')
const update_demo_account_with_closed_order = require('../services/update_demo_account_with_closed_order')


module.exports = async(req, res) => {
    try {

        const { product_type, tournament_id, id_list } = req.body.input
        var message = 'Đóng lệnh không thành công'


        const price_type = PRICE_OBJECT[product_type]
        const { session_variables } = req.body
        const user_id = session_variables['x-hasura-user-id']

        if (!id_list || id_list.length == 0) {
            return res.status(400).json({
                code: `order_closed`,
                message: `Đóng tất cả lệnh không thành công`
            })
        }

        // const {id_list, tournament_id, user_id} = req.body

        const variables = {
            tournament_id_list: [tournament_id],
            product_type
        }

        const validate_tournaments = await check_validate_tournament(variables)
        if (validate_tournaments.length == 0) {
            return res.status(400).json({
                code: `tournament_invalid|investment_too_low`,
                message: `Đóng lệnh không thành công: số tiền đặt quá thấp hoặc tournament không phù hợp`
            })
        }

        const market_status = await check_market_status(price_type)

        if (!market_status) {
            return res.status(400).json({
                code: `market_closed`,
                message: `Đóng lệnh không thành công: thị trường đã đóng`
            })
        }

        const item = {
            user_list: [user_id],
            is_checked: false,
            tournament_list: [tournament_id],
            id_list
        }
        const { list: order_list } = await get_list(item)
        var mutation_sentence = ''
        const current_time = new Date().toISOString()

        for (var i = 0; i < order_list.length; i++) {
            const { investment, id, counter_time, end_time, tournament_id, user_id } = order_list[i]

            // if current_time > end_time => order binary is not close => miss order of client => allow client close any time
            // if current_time < end_time => only allow client close order when check_time_for_order is true
            if (current_time < end_time) {
                // only create or close order when time is not expire time
                try {
                    await check_time_for_order(counter_time)
                } catch (error) {
                    message = "Vượt quá thời gian đóng lệnh."
                    continue
                }

            }

            const mutation_item = ` A${i}: update_demo_history_binary(where: {id: {_eq: "${id}"}, is_checked: {_eq: false}}, 
              _set: {status: ${BINARY_CANCEL_STATUS}, is_checked: true, updated_at: "${new Date().toISOString()}"}) {
              affected_rows
              returning {
                asset
                close_price
                created_at
                end_time
                status
                equity
                id
                investment
                open_price
                percent_profit_loss
                start_time
                total_profit_loss
                tournament_id
                type
                updated_at
                user_id
              }
            }

            B${i}:update_demo_account(where: {tournament_id: {_eq: "${tournament_id}"}, user_id: {_eq: "${user_id}"}}, _inc: {balance: ${investment}}, _set: {updated_at: "${new Date().toISOString()}"}) {
              returning {
                balance
                id
                created_at
                rank
                reward_id
                total_margin
                tournament_id
                updated_at
                user_id
              }
            }    
            `
            mutation_sentence += mutation_item
        }

        if (mutation_sentence.length > 1) {
            const STOP_BINARY_ORDER = `mutation MyMutation { ${mutation_sentence} }`

            const result = await handler_hasura(null, STOP_BINARY_ORDER)

            const DEMO_ACCOUNT = `query MyQuery($user_id: uuid!, $tournament_id_list: [uuid!]) {
              demo_account(where: {user_id: {_eq: $user_id}, tournament_id: {_in: $tournament_id_list}}) {
                balance
                created_at
                id
                reward_id
                total_margin
              }
            }`

            const demo_variables = {
                user_id,
                tournament_id_list: [tournament_id],
            }
            const demo_account = await handler_hasura(demo_variables, DEMO_ACCOUNT)

        } else {
            return res.status(400).json({
                code: `handle_fail`,
                message
            })

        }

        await update_demo_account_with_closed_order({
            user_id,
            tournament_id
        })


        return res.json({
            status: 200,
            message: 'close binary order success',
            data: true
        })

    } catch (error) {
        console.log(error)
        return res.status(400).json({
            code: `handle_fail`,
            message: `Đóng lệnh không thành công`
        })
    }
}