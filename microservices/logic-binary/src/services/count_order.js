const handler_hasura = require('../helpers/handler_hasura')

module.exports = (item) => new Promise(async(resolve, reject) => {
    try {

        let query_list = `_in`
        if (!item.asset_list) {
            item.asset_list = []
            query_list = `_nin`
        }

        const GET_BINARY = `query MyQuery ($end_time: timestamptz!, $is_checked: Boolean, $asset_list: [String!], $now_day:timestamptz){
          demo_history_binary_aggregate(
                where: {
                    end_time: {_eq: $end_time}, is_checked: {_eq: $is_checked}, asset: {${query_list}: $asset_list},
                     tournament: {start_time: {_lte: $now_day}, end_time: {_gt: $now_day}}
                }
            ) {
              aggregate {
                count
              }
            }
          }
          `

        const variables = {
            end_time: item.end_time,
            is_checked: item.is_checked,
            now_day: new Date().toISOString(),
            asset_list: item.asset_list
        }

        const result = await handler_hasura(variables, GET_BINARY)

        const order_length = result.data.demo_history_binary_aggregate.aggregate.count
        return resolve(order_length)

    } catch (error) {
        console.log(error, "error get order length of binary")
        return reject(error)
    }
})