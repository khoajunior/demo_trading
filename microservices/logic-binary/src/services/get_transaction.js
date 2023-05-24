const handler_hasura = require('../helpers/handler_hasura')

module.exports = (item) => new Promise(async(resolve, reject) => {
    try {

        let query_list = `_in`
        if (!item.asset_list) {
            item.asset_list = []
            query_list = `_nin`
        }

        const GET_BINARY = `query MyQuery ($end_time: timestamptz!, $is_checked: Boolean, $asset_list: [String!], $now_day:timestamptz, $limit:Int, $offset: Int){
            demo_history_binary(
                where: {
                    end_time: {_eq: $end_time}, is_checked: {_eq: $is_checked}, asset: {${query_list}: $asset_list},
                     tournament: {start_time: {_lte: $now_day}, end_time: {_gt: $now_day}}
                },
                order_by: {created_at: asc},
                offset: $offset,
                limit: $limit

            ) {
              asset
              close_price
              created_at
              end_time
              assetByAsset {
                created_at
                scale_percent
                swap_id
                updated_at
                name
                id
              }
              tournament_id
              tournament {
                  updated_at
                  start_time
                  organizer
                  name
                  end_time
                  id
                  created_at
              }
              equity
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
            }
        }`

        const variables = {
            end_time: item.end_time,
            is_checked: item.is_checked,
            now_day: new Date().toISOString(),
            asset_list: item.asset_list,
            limit: item.limit || null, 
            offset: item.offset || null
        }


        // console.log({variables})

        const result = await handler_hasura(variables, GET_BINARY)

        const binary_list = result.data.demo_history_binary
        return resolve(binary_list)

    } catch (error) {
        console.log(error, "error herre")
        return reject(error)
    }
})