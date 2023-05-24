const { HASURA_URL, HASURA_ADMIN_SECRET, STATUS_PENDING, STATUS_ACTIVE, STATUS_CLOSE, STATUS_CANCEL } = require('../../constants/constants')
const fetch = require('node-fetch')
const handler_hasura = require('../helpers/handler_hasura')

// const { convert_usd, get_pip_value, get_margin, get_gross_profit_loss, get_margin_level_percent, get_available } = require('./support_calculate')

//-----------Support Query db---------------------------------------------------------------------------------------------------------------------------------------------------
//get sum margin of all open order by user_id
const get_sum_margin = (user_id, status = [STATUS_PENDING, STATUS_ACTIVE]) => new Promise(async(resolve, reject) => {
    try {
        const my_query = `query MyQuery($user_id: uuid, $status: [Int!]) {
            demo_history_forex_aggregate(where: {
                user_id: {_eq: $user_id}, 
                status: {_in: $status}
            }) 
            {
              aggregate {
                sum {
                  margin
                }
              }
            }
          }         
          `
        let variables = {
            user_id: user_id,
            status,
        }

        const result = await handler_hasura(variables, my_query)

        return resolve(result.data.demo_history_forex_aggregate.aggregate.sum.margin || 0)
    } catch (err) {
        return reject(err)
    }
})


//-----------Support Query db---------------------------------------------------------------------------------------------------------------------------------------------------
//get all order in database
const get_all_order = (item) => new Promise(async(resolve, reject) => {
    try {
        let query_list_user = `_in`
        if (!item.user_list) {
            item.user_list = []
            query_list_user = `_nin`
        }

        let query_list_status = `_in`
        if (!item.status) {
            item.status = []
            query_list_status = `_nin`
        }

        let query_list_asset = `_in`
        if (!item.asset_list) {
            item.asset_list = []
            query_list_asset = `_nin`
        }

        const my_query = `query MyQuery($user_list: [uuid!], $status: [Int!], $now_day: timestamptz, $asset_list: [String!]) {
          demo_history_forex(where: {user_id: {${query_list_user}: $user_list}, status: {${query_list_status}: $status}, tournament: {start_time: {_lte: $now_day}, end_time: {_gt: $now_day}}, asset: {${query_list_asset}: $asset_list}}) {
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
            status: item.status,
            asset_list: item.asset_list,
            now_day: new Date().toISOString()
        }
        const result = await handler_hasura(variables, my_query)
        return resolve(result.data.demo_history_forex)
    } catch (err) {
        return reject(err)
    }
})


module.exports = {
    get_sum_margin,
    get_all_order
}