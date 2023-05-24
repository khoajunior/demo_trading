const handler_hasura = require('../helpers/handler_hasura')

module.exports = (item) => new Promise(async(resolve, reject) => {
    try {
        const tournament_list = item.tournament_id_list || []
        let query_list_tournament = `_in`
        if (tournament_list.length == 0) {
            query_list_tournament = `_nin`
        }

        const GET_ORDER_FOREX = `
          query MyQuery ($tournament_id_list: [uuid!]){
            demo_history_forex(where: {tournament_id: {${query_list_tournament}: $tournament_id_list}}) {
              asset
              close_price
              count_id
              created_at
              dividends
              end_time
              fn_net_profit_loss
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
              swap
              take_profit
              tournament_id
              transaction_type
              type
              updated_at
              user_id
            }
          }
          `

        const variables = {
            tournament_id_list: tournament_list
        }

        const result = await handler_hasura(variables, GET_ORDER_FOREX)

        return resolve(result.data.demo_history_forex)


    } catch (error) {
        console.log(error)
        return reject(`Lấy danh sách lệnh CFD không thành công`)
    }
})