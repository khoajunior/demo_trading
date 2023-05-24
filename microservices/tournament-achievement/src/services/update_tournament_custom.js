const handler_hasura = require('../helpers/handler_hasura')
const { TOURNAMENT_ACTIVE_STATUS, DEFAULT_LEVERAGE_CRYPTO, DEFAULT_LEVERAGE_STOCK, DEFAULT_LEVERAGE, DEFAULT_LEVERAGE_COMMODITY, ROLE_ADMIN, ROLE_HASURA_ADMIN } = require('../../constants/constants')
const get_tournament_by_id = require('./get_tournament_by_id')
const { get_leverage } = require('./tournament')

const CREATE_LEVERAGE_TOURNAMENT = `mutation MyMutation($objects: [leverage_tournament_insert_input!]!) {
    insert_leverage_tournament(objects: $objects) {
      returning {
        id
        tournament_id
        created_at
        updated_at
        leverage {
          id
          leverage
        }
      }
    }
  }
  
  `

const CREATE_REWARD_RULE_TOURNAMENT = `mutation MyMutation($objects: [reward_rule_tournament_insert_input!]!) {
    insert_reward_rule_tournament(objects: $objects) {
      returning {
        id
        reward_rule_id
        tournament_id
        created_at
        updated_at
        reward_rule {
          id
          name
          format_name
        }
      }
    }
  }
  
  `

const CREATE_REWARD = `mutation MyMutation($objects: [reward_insert_input!]!) {
    insert_reward(objects: $objects) {
      returning {
        id
        name
        level
        amount
        value
        tournament {
          id
          name
        }
        
      }
    }
  }
  `

module.exports = (item) => new Promise(async (resolve, reject) => {
  try {
    const { user_id, tournament_id } = item
    const time = new Date().toISOString()

    let update_sentence = ``
    let variables = {
      tournament_id,
      user_id,
      time,
    }

    //name
    if (item.name) {
      update_sentence += `name: $name,`
      variables.name = item.name
    }

    //organizer
    if (item.organizer) {
      update_sentence += `organizer: $organizer, `
      variables.organizer = item.organizer
    }

    //start_time
    const response_tournament = await get_tournament_by_id(tournament_id)
    let { start_time } = response_tournament[0]
    if (item.start_time) {
      start_time = item.start_time
      update_sentence += `start_time: $start_time,`
      variables.start_time = item.start_time
    }

    //end_time
    if (item.end_time) {
      if (item.end_time <= time) {
        return reject(`New end_time: ${item.end_time} < time_now:${time} `)
      }
      if (item.end_time <= start_time) {
        return reject(`New end_time: ${item.end_time} <= start_time `)
      }
      update_sentence += `end_time: $end_time,`
      variables.end_time = item.end_time
    }

    // description
    if (item.description) {
      update_sentence += `description: $description, `
      variables.description = item.description
    }


    // max_amount
    if (item.max_amount) {
      update_sentence += `max_amount: $max_amount, `
      variables.max_amount = item.max_amount
    }

    // reward_receiving_term
    if (item.reward_receiving_term) {
      update_sentence += `reward_receiving_term: $reward_receiving_term, `
      variables.reward_receiving_term = item.reward_receiving_term
    }

    //total_reward
    if (item.total_reward) {
      update_sentence += `total_reward: $total_reward, `
      variables.total_reward = item.total_reward
    }

    //default_balance
    if (item.default_balance) {
      update_sentence += `default_balance: $default_balance, `
      variables.default_balance = item.default_balance
    }

    //min_amount
    if (item.min_amount) {
      update_sentence += `min_amount: $min_amount, `
      variables.min_amount = item.min_amount
    }

    //guide_join
    if (item.guide_join) {
      update_sentence += `guide_join: $guide_join, `
      variables.guide_join = item.guide_join
    }

    //object: đối tượng tham gia
    if (item.object) {
      update_sentence += `object: $object, `
      variables.object = item.object
    }

    //method_receive_reward
    if (item.method_receive_reward) {
      update_sentence += `method_receive_reward: $method_receive_reward, `
      variables.method_receive_reward = item.method_receive_reward
    }

    //link_rule_condition
    if (item.link_rule_condition) {
      update_sentence += `link_rule_condition: $link_rule_condition, `
      variables.link_rule_condition = item.link_rule_condition
    }

    //frequency
    if (item.frequency) {
      update_sentence += `frequency: $frequency, `
      variables.frequency = item.frequency
    }

    //product_type
    if (item.product_type) {
      update_sentence += `product_type: $product_type, `
      variables.product_type = item.product_type
    }

    if (item.cover_image) {
      update_sentence += `cover_image: $cover_image, `
      variables.cover_image = item.cover_image
    }

    //reward_receiving_condition
    if (item.reward_receiving_condition) {
      update_sentence += `reward_receiving_condition: $reward_receiving_condition, `
      variables.reward_receiving_condition = item.reward_receiving_condition
    }


    var brand_query = ``
    var brand_condition = ''
    const { user_role } = item

    // if (user_role != ROLE_ADMIN && user_role != ROLE_HASURA_ADMIN) {
    //   brand_query = ` ,$brand_id: uuid!`
    //   brand_condition = ` ,brand_id: {_eq: $brand_id}`
    //   variables.brand_id = item.brand_id
    // }

    const UPDATE_TOURNAMENT = `
            mutation MyMutation(
              $tournament_id: uuid, $user_id: uuid, $name: String, 
              $organizer: String, $start_time: timestamptz,$end_time: timestamptz, $time: timestamptz, 
              $total_reward: float8, $default_balance: float8, $min_amount: float8, $guide_join: String, 
              $object: String, $method_receive_reward: String, 
              $link_rule_condition: String, $frequency: Int, $product_type: Int, 
              $cover_image: String ${brand_query},
              $description: String, $reward_receiving_term: String, $max_amount: float8, 
              $reward_receiving_condition: String,
            ) {
                update_tournament(where: {id: {_eq: $tournament_id}, status: {_eq: ${TOURNAMENT_ACTIVE_STATUS}} ${brand_condition}}, _set: {
                  updated_by: $user_id, 
                  ${update_sentence}
                  updated_at: $time
                  
                }) 
                {
                  returning {
                    reward_receiving_condition
                    id
                    created_at
                    created_by
                    default_balance
                    end_time
                    cover_image
                    frequency
                    guide_join
                    is_default
                    is_finished
                    link_rule_condition
                    method_receive_reward
                    min_amount
                    max_amount
                    description
                    reward_receiving_term
                    brand_tournaments {
                      brand {
                        created_at
                        id
                        name
                        updated_at
                      }
                    }
                    name
                    object
                    option_trade
                    organizer
                    product_type
                    start_time
                    status
                    total_reward
                    updated_at
                    updated_by
                  }
                }
              }

            `

    const UPDATE_BRAND_TOURNAMENTS = `
      mutation MyMutation(
        $tournament_id: uuid,
        $brand_tournaments: [brand_tournament_insert_input!]!
      ) {
          delete_brand_tournament(where:{tournament_id: {_eq: $tournament_id}}) {
            affected_rows
          }
          
          insert_brand_tournament(objects: $brand_tournaments) {
            affected_rows
          }
        }
      `

    let result = await handler_hasura(variables, UPDATE_TOURNAMENT)
    if (result.data.update_tournament.returning.length == 0) {
      return reject(`Tournament ${tournament_id} not found or inactived or finished`)
    }
    result = result.data.update_tournament.returning[0]

    if (item.brand_ids) {
      const brandTournamentsVariables = {
        tournament_id: tournament_id,
        brand_tournaments: []
      }

      for (const brand_id of item.brand_ids) {
        brandTournamentsVariables.brand_tournaments.push({
          brand_id,
          tournament_id
        })
      }
      await handler_hasura(brandTournamentsVariables, UPDATE_BRAND_TOURNAMENTS)
    }


    //leverage
    //Kiểm tra các loại giải đấu có leverage mặc định        
    if (result.option_trade == 2) {
      let response
      switch (result.product_type) {
        case 2: //Giải đấu CFD stock
          response = await get_leverage({ leverage: DEFAULT_LEVERAGE_STOCK })
          item.leverage_list = [response.id]
          break;
        case 3: //Giải đấu CFD commodity
          response = await get_leverage({ leverage: DEFAULT_LEVERAGE_COMMODITY })
          item.leverage_list = [response.id]
          break;
        case 4: //Giải đấu CFD crypto
          response = await get_leverage({ leverage: DEFAULT_LEVERAGE_CRYPTO })
          item.leverage_list = [response.id]
          break;
        default:
          response = await get_leverage({ leverage: DEFAULT_LEVERAGE })//Default leverage
          item.leverage_list = [response.id]
      }
    }
    if (item.leverage_list && result.option_trade != 1) {
      //xóa leverage cũ
      const item_delete = { tournament_id, table_name: `leverage_tournament` }
      await delete_item_tournament(item_delete)

      const data_input = item.leverage_list.map(leverage => {
        const data = {
          leverage_id: leverage,
          tournament_id
        }
        return data
      })

      variables = {
        objects: data_input
      }

      const result_leverage = await handler_hasura(variables, CREATE_LEVERAGE_TOURNAMENT)
      result.leverage_list = result_leverage.data.insert_leverage_tournament.returning
    }

    //reward
    if (item.reward_list) {
      //xóa reward cũ
      const item_delete = { tournament_id, table_name: `reward` }
      await delete_item_tournament(item_delete)

      const data_input = item.reward_list.map(reward => {
        const { name, value, amount, picture, level } = reward
        const data = {
          name,
          value,
          amount,
          picture,
          level,
          tournament_id
        }
        return data
      })

      variables = {
        objects: data_input
      }

      const result_reward = await handler_hasura(variables, CREATE_REWARD)
      result.reward_list = result_reward.data.insert_reward.returning
    }

    //reward_rule
    if (item.reward_rule_list) {
      //xóa reward_rule cũ
      const item_delete = { tournament_id, table_name: `reward_rule_tournament` }
      await delete_item_tournament(item_delete)

      const data_input = item.reward_rule_list.map(reward_rule => {
        const data = {
          reward_rule_id: reward_rule,
          tournament_id
        }
        return data
      })

      variables = {
        objects: data_input
      }

      const result_reward_rule = await handler_hasura(variables, CREATE_REWARD_RULE_TOURNAMENT)
      result.reward_rule_list = result_reward_rule.data.insert_reward_rule_tournament.returning
    }

    return resolve(result)
  } catch (err) {
    console.error(err)
    return reject(`Cập nhật giải đấu không thành công: ${err}`)
  }
})

//input: tournament_id,item_list,table_name
const delete_item_tournament = (item) => new Promise(async (resolve, reject) => {
  try {
    const { tournament_id, table_name } = item

    let query_list_item = `_in`
    let item_list = item.item_list
    if (!item.item_list) {
      item_list = []
      query_list_item = `_nin`
    }

    const variables = {
      tournament_id,
      item_list,
      time: new Date().toISOString()
    }

    const DELETE_ITEM = `mutation MyMutation($tournament_id: uuid, $time: timestamptz, $item_list: [uuid]) {
          delete_${table_name}(where: {
            tournament: {
              id: {_eq: $tournament_id}, 
              status: {_eq: ${TOURNAMENT_ACTIVE_STATUS}}, 
              end_time: {_gte: $time}
            }, 
            id: {${query_list_item}: $item_list}
          }) 
          {
            returning {
              tournament {
                id
                name
                rewards {
                  id
                  name
                }
                leverage_tournaments {
                  leverage {
                    id
                    leverage
                  }
                }
                reward_rule_tournaments {
                  reward_rule {
                    id
                    name
                    format_name
                  }
                }
              }
            }
          }
        }
        `
    const result = await handler_hasura(variables, DELETE_ITEM)
    return resolve(result)
  } catch (err) {
    console.error(err)
    return reject(err)
  }
})