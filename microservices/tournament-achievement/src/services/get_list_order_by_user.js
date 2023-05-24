const handler_hasura = require('../helpers/handler_hasura')

//Get list order by user
//Require: user_id
//Optional: start_time,end_time
module.exports = (item) => new Promise(async(resolve, reject) => {
    try {
        const { user_id } = item
        const start_time = item.start_time || '2000-01-01'
        const end_time = item.end_time || '3000-01-01'
        const sort_by = item.sort_by || 'created_at'
        const sort_direction = item.sort_direction || `desc`

        const GET_LIST = `query MyQuery($user_id: uuid!,$start_time:timestamptz,$end_time: timestamptz) {
          user_profile(where: {id: {_eq: $user_id}}) {
            demo_history_binaries_aggregate(where: {created_at: {_gte: $start_time, _lte: $end_time}},
              order_by: {${sort_by}: ${sort_direction}}
              ) {
              aggregate {
                count
              }
              nodes {
                id
                asset
                created_at
                open_price
                close_price
                end_time
                total_profit_loss
                IP
                tournament {
                  id
                  name
                  option_trade
                  product_type
                }
              }
            }
            demo_history_forexes_aggregate(where: {created_at: {_gte: $start_time, _lte: $end_time}},
              order_by: {${sort_by}: ${sort_direction}}
              ) {
              aggregate {
                count
              }
              nodes {
                id
                asset
                created_at
                open_price
                close_price
                end_time
                net_profit_loss
                IP
                tournament {
                  id
                  name
                  option_trade
                  product_type
                }
              }
            }
          }
        }        
        `
        const variables = {
            user_id,
            start_time,
            end_time
        }

        let response = await handler_hasura(variables, GET_LIST)
        response = response.data.user_profile[0]

        const total_items = response.demo_history_binaries_aggregate.aggregate.count + response.demo_history_forexes_aggregate.aggregate.count
        console.log({ total_items })

        let order_list = []
        response.demo_history_binaries_aggregate.nodes.forEach(order => { //Lấy danh sách lệnh binary            
            const { asset, created_at, end_time, open_price, close_price, total_profit_loss, IP, tournament } = order
            const { name, option_trade, product_type } = tournament //Lấy thông tin của tournament
            const item = {
                tournament_name: name,
                type_trade: option_trade,
                product_trade: product_type,
                asset,
                created_at,
                open_price,
                close_price,
                end_time,
                total_profit_loss,
                IP
            }
            order_list.push(item)
        })

        response.demo_history_forexes_aggregate.nodes.forEach(order => { //Lấy danh sách lệnh CFD            
            const { asset, created_at, end_time, open_price, close_price, net_profit_loss, IP, tournament } = order
            const { id, name, option_trade, product_type } = tournament //Lấy thông tin của tournament
            const item = {
                tournament_name: name,
                type_trade: option_trade,
                product_trade: product_type,
                asset,
                open_price,
                close_price,
                created_at,
                end_time,
                total_profit_loss: net_profit_loss,
                IP
            }
            order_list.push(item)
        })

        return resolve({ order_list, total_items })
    } catch (err) {
        console.error(err)
        return reject(`Lấy danh sách lệnh của user thất bại`)
    }
})