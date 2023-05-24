const handler_hasura = require('../helpers/handler_hasura')

const get_all_order = (item) => new Promise(async(resolve, reject) => {
    try {
        const user_list_input = item.user_list || []
        const status_list_input = item.status_list || []
        const asset_list_input = item.asset_list || []
        const tournament_list_input = item.tournament_list || []

        let query_list_user = `_in`
        if (user_list_input.length == 0) {
            query_list_user = `_nin`
        }
        let query_list_status = `_in`
        if (status_list_input.length == 0) {
            query_list_status = `_nin`
        }
        let query_list_asset = `_in`
        if (asset_list_input.length == 0) {
            query_list_asset = `_nin`
        }
        let query_list_tournament = `_in`
        if (tournament_list_input.length == 0) {
            query_list_tournament = `_nin`
        }


        const my_query = `query MyQuery($user_list: [uuid!], $status_list: [Int!], $now_day: timestamptz, $asset_list: [String!], $tournament_list: [uuid!]) {
            demo_history_forex(where: {user_id: {${query_list_user}: $user_list}, status: {${query_list_status}: $status_list}, tournament: {start_time: {_lte: $now_day}, end_time: {_gt: $now_day}}, asset: {${query_list_asset}: $asset_list}, tournament_id: {${query_list_tournament}: $tournament_list}}) {
              id
              count_id
              asset
              quantity
              leverage
              dividends
              open_price
              close_price
              start_time
              end_time
              type
              margin
              status
              pending_price
              take_profit
              stop_loss
              swap
              gross_profit_loss
              fn_net_profit_loss
              net_profit_loss
              user_id
              user_profile {
                name
              }
              created_at
              updated_at
              tournament {
                created_at
                end_time
                id
                name
                organizer
                start_time
                updated_at
              }
              tournament_id
            }

            demo_account(where: {
                tournament_id: {${query_list_tournament}: $tournament_list},
                user_id: {${query_list_user}: $user_list}
            }) {
                balance
                closed_order_at
                created_at
                rank
                tournament_id
                updated_at
                user_id
                total_margin
                reward_id
              }
          }
          `
        const variables = {
            user_list: user_list_input,
            status_list: status_list_input,
            asset_list: asset_list_input,
            now_day: new Date().toISOString(),
            tournament_list: tournament_list_input

        }
        const result = await handler_hasura(variables, my_query)

        return resolve({
            forex_list: result.data.demo_history_forex,
            account: result.data.demo_account[0]
        })

    } catch (err) {
        return reject(err)
    }
})


module.exports = {

    get_all_order,

}