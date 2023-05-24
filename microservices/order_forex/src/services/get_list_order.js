const handler_hasura = require('../helpers/handler_hasura')

//Input: user_id,id( list id of order),status,tournament_id
module.exports = (item) => new Promise(async(resolve, reject) => {
    try {
        const user_id = item.user_id
        let id_list = item.id || []
        const status = item.status
        const tournament_id = item.tournament_id
        const min_time_order = item.min_time_order || '3000-01-01'

        let query_list_id = `_in`
        if (id_list.length == 0) {
            query_list_id = `_nin`
        }

        const variables = {
          user_id,
          id_list,
          status,
          tournament_id,
        }

        let query_time_over=``
        if(item.min_time_order){
          query_time_over=`start_time: {_lt: $min_time_order}`
          variables.min_time_order=min_time_order
        }

        const GET_LIST_ORDER = `query MyQuery($user_id:uuid, $id_list:[uuid!],$status:Int,$tournament_id:uuid, $min_time_order: timestamptz) {
        demo_history_forex(where: { 
            user_id: {_eq:$user_id} 
            status: {_eq: $status}, 
            id: {${query_list_id}: $id_list},
            tournament_id: {_eq: $tournament_id},
            ${query_time_over}
        }) 
        {
            id
            count_id
            asset
            quantity
            leverage
            type
            dividends
            open_price
            close_price
            start_time
            end_time
            status
            pending_price
            take_profit
            stop_loss
            swap
            gross_profit_loss
            net_profit_loss
            user_id
            user_profile {
              id
              name
              demo_accounts {
                id
                balance
              }
            }
            tournament {
              updated_at
              start_time
              organizer
              name
              end_time
              id
              created_at
            }
            tournament_id
            created_at
            updated_at
            fn_net_profit_loss
          }
        }
        `;

        

        const result = await handler_hasura(variables, GET_LIST_ORDER)

        if (result.data.demo_history_forex.length === 0) {
            return reject(`Order ${item.id} with status ${status} in tournament ${tournament_id} not found`)
        }

        return resolve(result.data.demo_history_forex)
    } catch (err) {
        console.error(err)
        return reject(err)
    }
})