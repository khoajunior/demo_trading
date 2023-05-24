const handler_hasura = require('../helpers/handler_hasura')


module.exports = (item) => new Promise(async(resolve, reject) => {
    try {

        const start_day = item.start_day || '2000-01-01'
        const end_day = item.end_day || '3000-01-01'
        const sort_by = item.sort_by || ' created_at'
        const sort_direction = item.sort_direction || 'desc'
        const page_size = item.page_size || null
        const page_number = item.page_number || 0
        let user_list = item.user_list || []
        const offset = page_size ? page_number * page_number : null
        let is_checked = item.is_checked || []
        let tournament_list = item.tournament_list || []
        let id_list = item.id_list || []

        //query is_checked,user_list,id_list,tournament_list
        let query_list_is_check = `_in`
        if (is_checked.length == 0) {
            query_list_is_check = `_nin`
        }

        let query_list_user_list = `_in`
        if (user_list.length == 0) {
            query_list_user_list = `_nin`
        }

        let query_list_id_list = `_in`
        if (id_list.length == 0) {
            query_list_id_list = `_nin`
        }

        let query_list_tournament_list = `_in`
        if (tournament_list.length == 0) {
            query_list_tournament_list = `_nin`
        }

        const BINARY_LIST = `query MyQuery($limit: Int, $offset: Int, $sort_direction: order_by, $is_checked: [Boolean!], $user_list: [uuid!], $start_time: timestamptz, $end_time: timestamptz, $tournament_list: [uuid!], $id_list: [uuid!]) {
          demo_history_binary(limit: $limit, offset: $offset, order_by: {${sort_by}: $sort_direction}, where: {is_checked: {${query_list_is_check}: $is_checked}, user_id: {${query_list_user_list}: $user_list}, created_at: {_gte: $start_time, _lte: $end_time},id: {${query_list_id_list}: $id_list} ,tournament_id: {${query_list_tournament_list}: $tournament_list}}) {
            asset
            close_price
            created_at
            end_time
            equity
            counter_time
            id
            investment
            is_checked
            open_price
            percent_profit_loss
            start_time
            total_profit_loss
            type
            updated_at
            user_id
            assetByAsset {
              created_at
              id
              name
              scale_percent
              swap_id
              updated_at
            }
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
          demo_history_binary_aggregate(where: {user_id: {${query_list_user_list}: $user_list}, created_at: {_gte: $start_time, _lte: $end_time}, is_checked: {${query_list_is_check}: $is_checked},id: {${query_list_id_list}: $id_list}, tournament_id: {${query_list_tournament_list}: $tournament_list}}) {
            aggregate {
              count
            }
          }
        }
        
        `

        const variables = {
            user_list,
            start_time: start_day,
            end_time: end_day,
            offset,
            sort_direction,
            limit: page_size,
            is_checked,
            tournament_list,
            id_list
        }

        const result = await handler_hasura(variables, BINARY_LIST)
        const order_list = result.data.demo_history_binary
        const total_items = result.data.demo_history_binary_aggregate.aggregate.count

        const data = {
            list: order_list,
            total_items
        }

        return resolve(data)

    } catch (error) {
        console.log(error)
        return reject(error)
    }
})