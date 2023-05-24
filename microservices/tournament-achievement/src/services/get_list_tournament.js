const handler_hasura = require('../helpers/handler_hasura')

//Get list tournament
//Require: 
//Optional: tournament_id( array), start_time,end_time
module.exports = (item) => new Promise(async (resolve, reject) => {
  try {
    //Kiểm tra trường hợp không truyền tournament_id list
    let tournament_id = item.tournament_id || []
    let query_tournament = `_in`
    if (tournament_id.length === 0) {
      query_tournament = `_nin`
    }

    const start_time = item.start_time || '2000-01-01'
    const end_time = item.end_time || '3000-01-01'
    const sort_by = item.sort_by || 'created_at'
    const sort_direction = item.sort_direction || `desc`

    const GET_LIST_TOURNAMENT = `query MyQuery($tournament_id: [uuid!], $start_time: timestamptz, $end_time: timestamptz) {
            tournament_aggregate(where: {id: {${query_tournament}: $tournament_id}, status: {_neq: 2}, created_at: {_gte: $start_time, _lte: $end_time}},
              order_by: {${sort_by}: ${sort_direction}}
              ) {
              aggregate {
                count
              }
              nodes {
                id
                name
                created_at
                created_by
                default_balance
                end_time
                frequency
                guide_join
                is_default
                is_deleted_redis
                is_finished
                link_rule_condition
                method_receive_reward
                min_amount
                object
                option_trade
                organizer
                product_type
                start_time
                status
                total_reward
                updated_at
                updated_by
                demo_accounts_aggregate {
                    aggregate {
                      count
                    }
                }
                rewards {
                  id
                  name
                  value
                  amount
                  level
                  picture
                }
                reward_rule_tournaments {
                  reward_rule {
                    id
                    name
                    format_name
                  }
                }
                leverage_tournaments {
                  leverage {
                    id
                    leverage
                  }
                }
              }
            }
          }
          `

    const variables = {
      tournament_id,
      start_time,
      end_time
    }

    const response = await handler_hasura(variables, GET_LIST_TOURNAMENT)

    const result = response.data.tournament_aggregate
    const total_items = result.aggregate.count
    // console.log({ total_items })

    return resolve({ tournament_list: result.nodes, total_items })
  } catch (err) {
    console.error(err)
    return reject(`Lấy danh sách giải đấu không thành công`)
  }
})