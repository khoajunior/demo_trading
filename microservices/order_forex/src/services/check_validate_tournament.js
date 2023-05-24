const handler_hasura = require('../helpers/handler_hasura')
const { TOURNAMENT_DELETE_STATUS, OPTION_FOREX_TRADE } = require('../../constants/constants')

module.exports = (item, check_min_amount = false, check_max_amount = false) => new Promise(async(resolve, reject) => {
    try {
        let tournament_id_list = item.tournament_id_list || []
        // let quantity = 99999999
        let quantity = item.quantity || 0
        let query_list_tournament_id_list = `_in`
        let query_product_type = ''
        const { product_type } = item

        if (tournament_id_list.length == 0) {
            query_list_tournament_id_list = `_nin`
        }

        let query_min_amount=``
        if (check_min_amount) {
            query_min_amount=`{min_amount: {_lte: $quantity}},`
        }

        let query_max_amount=``
        if(check_max_amount){
            query_max_amount=`{max_amount: {_gte: $quantity}},`
        }

        if (product_type) {
            query_product_type = `{product_type : {_eq: ${product_type}}}`
        }

        const variables = {
            current_time: new Date().toISOString(),
            status: TOURNAMENT_DELETE_STATUS,
            tournament_id_list,
            option_trade: OPTION_FOREX_TRADE,
        }

        if(check_max_amount||check_min_amount){
            variables.quantity=quantity
        }


        const GET_TOURNAMENT = `
          query MyQuery ($tournament_id_list: [uuid!], $status: Int, $current_time: timestamptz, $option_trade: Int,$quantity: float8){
            tournament(where: {
                  id: {${query_list_tournament_id_list}: $tournament_id_list},
                   _and: [ 
                        {end_time: {_gte: $current_time}}, 
                        {start_time: {_lte: $current_time}}, 
                        {status: {_neq: $status}},
                        ${query_min_amount}
                        ${query_max_amount}
                        {option_trade : {_eq: $option_trade}},
                        ${query_product_type}
                      ]
                  }) {
              id
              end_time
              is_finished
              name
              organizer
              start_time
              status
              total_reward
              option_trade
              updated_at
              updated_by
              product_type
              min_amount
            }
          }
          `
        

        
        const result = await handler_hasura(variables, GET_TOURNAMENT)

        return resolve(result.data.tournament)
    } catch (error) {
        console.log(error)
        return reject(error)
    }
})