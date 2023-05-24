const handler_hasura = require('../helpers/handler_hasura')
const { finish_tournament, get_tournament_end } = require('./achievements')
const { DEFAULT_LEVERAGE_CRYPTO, DEFAULT_LEVERAGE_STOCK, DEFAULT_LEVERAGE, DEFAULT_LEVERAGE_COMMODITY, ROLE_ADMIN, ROLE_HASURA_ADMIN } = require('../../constants/constants')


const CREATE_TOURNAMENT = `mutation MyMutation(
    $name: String!, $organizer: String, $start_time: timestamptz!, 
    $end_time: timestamptz!, $reward_list: [reward_insert_input!]!,
    $guide_join: String, $option_trade: Int, $product_type: Int,
    $object: String, $frequency: Int, $total_reward: float8, $method_receive_reward: String,
    $link_rule_condition: String, $default_balance: float8, $user_id: uuid, $min_amount: float8,
    $cover_image: String, $description: String, $reward_receiving_term: String,
    $max_amount: float8, $reward_receiving_condition: String,
    $brand_tournaments: [brand_tournament_insert_input!]!
  ) {
    insert_tournament(objects: {
      min_amount: $min_amount, name: $name, organizer: $organizer, 
        rewards: {data: $reward_list}, default_balance: $default_balance, 
        start_time: $start_time, end_time: $end_time, guide_join: $guide_join, 
        option_trade: $option_trade, product_type: $product_type, object: $object, 
        frequency: $frequency, total_reward: $total_reward, method_receive_reward: $method_receive_reward, 
        link_rule_condition: $link_rule_condition, created_by: $user_id, cover_image: $cover_image,
        description: $description, max_amount: $max_amount, reward_receiving_term: $reward_receiving_term, 
        reward_receiving_condition: $reward_receiving_condition,
        brand_tournaments: {
          data: $brand_tournaments
        }
      }) {
      returning {
        reward_receiving_condition
        created_at
        default_balance
        end_time
        frequency
        guide_join
        id
        is_default
        is_finished
        link_rule_condition
        method_receive_reward
        min_amount
        max_amount
        description
        reward_receiving_term
        name
        object
        option_trade
        organizer
        product_type
        start_time
        status
        total_reward
        cover_image
        updated_at
        updated_by
        brand_tournaments {
          brand {
            created_at
            id
            name
            updated_at
          }
        }
        user_profile {
          id
          name
          role
          avatar
        }
      }
    }
  }
  
  `

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

//Update status tournament thành delete,KHÔNG PHẢI HÀM UPDATE CÁC THÔNG TIN TOURNAMENT
const update_status_delete_tournament = (item) => new Promise(async (resolve, reject) => {
  try {

    var brand_query = ``
    var brand_condition = ''
    const variables = {
      status: item.status,
      updated_by: item.user_id,
      tournament_id_list: item.tournament_id_list,
      updated_at: new Date().toISOString()
    }

    const { user_role } = item

    if (user_role != ROLE_ADMIN && user_role != ROLE_HASURA_ADMIN) {
      brand_query = ', $brand_id: uuid!',
        brand_condition = ', brand_id: {_eq: $brand_id}'
      variables.brand_id = item.brand_id

    }

    const UPDATE_TOURNAMENT = `mutation MyMutation ($tournament_id_list: [uuid!], $status: Int, $updated_at: timestamptz, $updated_by: uuid! ${brand_query}){
            update_tournament(where: {id: {_in: $tournament_id_list} ${brand_condition} }, _set: {status: $status, updated_by: $updated_by, updated_at: $updated_at}) {
              returning {
                created_at
                end_time
                cover_image
                id
                is_finished
                organizer
                name
                start_time
                status
                brand_id
                brand {
                    created_at
                    id
                    name
                    updated_at
                }
                total_reward
                updated_by
                updated_at
                option_trade
                product_type
              }
            }
          }
          `


    const result = await handler_hasura(variables, UPDATE_TOURNAMENT)

    return resolve(result.data.update_tournament.returning)
  } catch (error) {
    console.log(error)
    return reject(`Xóa giải đấu không thành công: `, error)
  }
})

const cron_finish_tournament = () => new Promise(async (resolve, reject) => {
  try {
    const list_tournament = await get_tournament_end()

    for (let i = 0; i < list_tournament.length; i++) {
      const tournament_id = list_tournament[i]
      try {
        await finish_tournament({ tournament_id })
      } catch (err) {
        console.error(err)
      }
    }
  } catch (err) {
    return reject(err)
  }
})

const check_user_in_tournament = (item) => new Promise(async (resolve, reject) => {
  try {
    const { user_id, tournament_id } = item

    const CHECK_USER_IN_TOURNAMENT = `query MyQuery($tournament_id: uuid, $user_id: uuid) {
            demo_account(where: {user_id: {_eq: $user_id}, tournament_id: {_eq: $tournament_id}}) {
              id
              balance
              tournament {
                id
                name
                option_trade
                end_time
              }
            }
          }`
    const variables = {
      user_id,
      tournament_id
    }
    const result = await handler_hasura(variables, CHECK_USER_IN_TOURNAMENT)

    if (result.data.demo_account.length == 0) {
      return reject('Bạn phải tham gia giải đấu này để thấy bảng xếp hạng.')
    }
    return resolve(result.data.demo_account[0])
  } catch (err) {
    console.error(err)
    return reject(`Kiểm tra người chơi trong giải đấu không thành công`)

  }
})

const create_tournament = (item) => new Promise(async (resolve, reject) => {
  try {
    //Data input
    const {
      name, organizer, reward_list, default_balance, start_time,
      end_time, guide_join, option_trade, product_type, object,
      frequency, total_reward, method_receive_reward, link_rule_condition, user_id,
      reward_rule_list, min_amount, cover_image, description, reward_receiving_term,
      max_amount, reward_receiving_condition, brand_ids
    } = item
    let { leverage_list } = item
    const brand_tournaments = []

    if (brand_ids && brand_ids.length > 0) {
      for(const brand_id of brand_ids) {
        brand_tournaments.push({
          brand_id
        })
      }
    }

    let variables = {
      name,
      organizer,
      reward_list,
      cover_image,
      default_balance,
      start_time,
      end_time,
      guide_join,
      option_trade,
      product_type,
      object,
      frequency,
      total_reward,
      method_receive_reward,
      link_rule_condition,
      user_id,
      min_amount,
      description,
      reward_receiving_term,
      max_amount,
      reward_receiving_condition,
      brand_tournaments
    }

    //Tạo tournament
    let tournament_created = await handler_hasura(variables, CREATE_TOURNAMENT)
    tournament_created = tournament_created.data.insert_tournament.returning[0]

    //Tạo leverage        
    if (option_trade == 2) {
      let response
      switch (tournament_created.product_type) {
        case 2: //Giải đấu CFD stock
          response = await get_leverage({ leverage: DEFAULT_LEVERAGE_STOCK })
          leverage_list = [response.id]
          break;
        case 3: //Giải đấu CFD commodity
          response = await get_leverage({ leverage: DEFAULT_LEVERAGE_COMMODITY })
          leverage_list = [response.id]
          break;
        case 4: //Giải đấu CFD crypto
          response = await get_leverage({ leverage: DEFAULT_LEVERAGE_CRYPTO })
          leverage_list = [response.id]
          break;
        default:
          response = await get_leverage({ leverage: DEFAULT_LEVERAGE })//Default leverage
          leverage_list = [response.id]
      }
    }
    //tạo row trong leverage_tournament
    if (leverage_list && tournament_created.option_trade != 1) {
      const data_input = leverage_list.map(item => {
        const data = {
          leverage_id: item,
          tournament_id: tournament_created.id
        }
        return data
      })

      variables = {
        objects: data_input
      }

      const result_leverage = await handler_hasura(variables, CREATE_LEVERAGE_TOURNAMENT)
      tournament_created.leverage_list = result_leverage.data.insert_leverage_tournament.returning
    }

    //Tạo reward_rule_list
    if (reward_rule_list) {
      const data_input = reward_rule_list.map(item => {
        const data = {
          reward_rule_id: item,
          tournament_id: tournament_created.id
        }
        return data
      })

      variables = {
        objects: data_input
      }

      const result_reward_rule = await handler_hasura(variables, CREATE_REWARD_RULE_TOURNAMENT)
      tournament_created.reward_rule_list = result_reward_rule.data.insert_reward_rule_tournament.returning
    }


    return resolve(tournament_created)
  } catch (err) {
    console.error(err)
    return reject(`Tạo giải đấu không thành công: ${err}`)
  }
})

const get_leverage = (item) => new Promise(async (resolve, reject) => {
  try {
    const { id } = item
    let variables = {
      id
    }
    let query_condition = `id: {_eq: $id}`
    let query_variable = `$id: uuid`
    if (item.leverage) {
      variables = {
        leverage: item.leverage
      }
      query_condition = `leverage: {_eq: $leverage}`
      query_variable = `$leverage: Int`
    }

    const GET_LEVERAGE = `query MyQuery(${query_variable} ) {
            leverage(where: {${query_condition}}) {
              id
              leverage
              created_at
              updated_at
            }
          }
          `
    const result = await handler_hasura(variables, GET_LEVERAGE)
    if (result.data.leverage.length == 0) {
      return reject(`Đòn bẩy không tồn tại`)
    }

    return resolve(result.data.leverage[0])
  } catch (err) {
    console.error(err)
    return reject(`Lấy đòn bẩy không thành công`)
  }
})

module.exports = {
  update_status_delete_tournament,
  cron_finish_tournament,
  check_user_in_tournament,
  create_tournament,
  get_leverage
}