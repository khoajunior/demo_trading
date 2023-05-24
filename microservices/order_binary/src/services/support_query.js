const handler_hasura = require('../helpers/handler_hasura')

const get_all_order = (item) => new Promise(async(resolve, reject) => {
    try {
        let query_list_user_list = `_in`
        if (!item.user_list) {
            item.user_list = []
            query_list_user_list = `_nin`
        }

        let query_list_status = `_in`
        if (!item.status) {
            item.status = []
            query_list_status = `_nin`
        }

        let query_list_asset_list = `_in`
        if (!item.asset_list) {
            item.asset_list = []
            query_list_asset_list = `_nin`
        }

        let query_list_tournament_list = `_in`
        if (!item.tournament_list) {
            item.tournament_list = []
            query_list_tournament_list = `_nin`
        }

        const my_query = `query MyQuery($user_list: [uuid!], $status_list: [Int!], $now_day: timestamptz, $asset_list: [String!], $tournament_list: [uuid!]) {
          demo_history_forex(where: {user_id: {${query_list_user_list}: $user_list}, status: {${query_list_status}: $status_list}, tournament: {start_time: {_lte: $now_day}, end_time: {_gt: $now_day}}, asset: {${query_list_asset_list}: $asset_list}, tournament_id: {${query_list_tournament_list}: $tournament_list}}) {
            id
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
        }
          `
        const variables = {
            user_list: item.user_list,
            status_list: item.status,
            asset_list: item.asset_list,
            tournament_list: item.tournament_list,
            now_day: new Date().toISOString(),
        }

        const result = await handler_hasura(variables, my_query)

        return resolve(result.data.demo_history_forex)

    } catch (err) {
        return reject(err)
    }
})

module.exports = {
    get_all_order
}