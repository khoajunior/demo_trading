const handler_hasura = require('../helpers/handler_hasura')
const get_tournament_by_id = require('../services/get_tournament_by_id')
const { OPTION_BINARY_TRADE, OPTION_FOREX_TRADE } = require('../../constants/constants')

//Get list order in tournament
//Require: tournament_id
//Optional: user_id( array),start_time,end_time
module.exports = (item) => new Promise(async(resolve, reject) => {
    try {
        let tournament_id = item.tournament_id
        if (!tournament_id) {
            return reject(`Tournament not found`)
        }
        const start_time = item.start_time || '2000-01-01'
        const end_time = item.end_time || '3000-01-01'
        const sort_by = item.sort_by || 'created_at'
        const sort_direction = item.sort_direction || `desc`
        let user_id = item.user_id || []
        if (typeof(item.user_id) == `string`) {
            user_id = [item.user_id]
        }
        let query_user = `_in`
        if (user_id.length === 0) {
            query_user = `_nin`
        }

        //Lấy thông tin tournament
        const response_tournament = await get_tournament_by_id(tournament_id)
        const tournament = response_tournament[0]
        const { name, option_trade, product_type } = tournament

        let query_order=`demo_history_binaries(where: {tournament_id: {_eq: $tournament_id}, created_at: {_gte: $start_time, _lte: $end_time}, user_id: {${query_user}: $user_id}},
            order_by: {${sort_by}: ${sort_direction}}
            ) {
            id
            asset
            created_at
            start_time
            end_time
            IP
            close_price
            counter_time
            equity
            investment
            is_checked
            open_price
            percent_profit_loss
            status
            total_profit_loss
            type
            updated_at
          }`
        if(option_trade===OPTION_FOREX_TRADE){
            query_order=`demo_history_forexes(where: {tournament_id: {_eq: $tournament_id}, created_at: {_gte: $start_time, _lte: $end_time}, user_id: {${query_user}: $user_id}},
                order_by: {${sort_by}: ${sort_direction}}
                ) {
                IP
                asset
                close_price
                created_at
                end_time
                gross_profit_loss
                id
                leverage
                margin
                net_profit_loss
                open_price
                pending_price
                quantity
                start_time
                status
                stop_loss
                take_profit
                swap
                type
                updated_at
              }`
        }
        const GET_LIST = `query MyQuery($tournament_id: uuid!, $user_id: [uuid!],$start_time: timestamptz, $end_time: timestamptz) {
          demo_account_aggregate(where: {tournament: {id: {_eq: $tournament_id}}}) {
            aggregate {
              count
            }
            nodes {
              user_profile {
                id
                name
                username
                email
                ${query_order}                
              }
            }
          }
        }`
        const variables = {
            tournament_id,
            start_time,
            end_time,
            user_id
        }

        const response = await handler_hasura(variables, GET_LIST)

        let order_list = []
        if (response.data.demo_account_aggregate.nodes.length > 0 && option_trade === OPTION_BINARY_TRADE) { //Trường hợp tournament Binary            
            response.data.demo_account_aggregate.nodes.forEach(user => {
                user.user_profile.demo_history_binaries.forEach(order => {
                    order.user = {
                        id: user.user_profile.id,
                        username: user.user_profile.username,
                        email: user.user_profile.email,
                    }
                    order_list.push(order)
                })
            })
        }
        if (response.data.demo_account_aggregate.nodes.length > 0 && option_trade === OPTION_FOREX_TRADE) { //Trường hợp tournament CFD
            response.data.demo_account_aggregate.nodes.forEach(user => {
                user.user_profile.demo_history_forexes.forEach(order => {
                    order.user = {
                        id: user.user_profile.id,
                        username: user.user_profile.username,
                        email: user.user_profile.email,
                    }
                    order.total_profit_loss = order.net_profit_loss
                    order_list.push(order)
                })
            })
        }
        const total_items = order_list.length

        return resolve({ tournament, order_list, total_items })
    } catch (err) {
        console.error(err)
        return reject(`Lấy danh sách lệnh theo giải đấu không thành công`)
    }
})