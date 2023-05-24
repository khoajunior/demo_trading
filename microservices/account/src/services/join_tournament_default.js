const handle_hasura = require('../helpers/handler_hasura')
const { EXCHANGE_LOGIC_SERVICE, PRICE_OBJECT, OPTION_FOREX_TRADE, DEFAULT_BALANCE, REALTIME_DEMO_ACCOUNT, TOURNAMENT_DELETE_STATUS } = require('../../constants/constants')
const { check_user_profile_valid } = require('./user')
const { get_tournament } = require('./tournament')
const ACTION = `Tham gia giải đấu không thành công`
const messageBroker = require('../core/message_broker')
const { redis_db } = require('../core/redis_db')

const GET_TOURNAMENT = `query MyQuery($time: timestamptz) {
  tournament(where: {is_default: {_eq: true}, end_time: {_gt: $time}, status: {_neq: ${TOURNAMENT_DELETE_STATUS}}}) {
    id
    default_balance
    created_at
    end_time
    frequency
    guide_join
    is_default
    is_finished
    link_rule_condition
    method_receive_reward
    min_amount
    name
    object
    option_trade
    organizer
    start_time
    product_type
    status
    total_reward
    updated_at
    updated_by
    product_type
    rewards {
      id
      name
      amount
      level
    }
  }
}

`

const JOIN_TOURNAMENT = `mutation MyMutation($demo_account_object: [demo_account_insert_input!]! ) {
  insert_demo_account(objects: $demo_account_object) {
      returning {
        id
        balance
        user_profile {
          id
          name
          ticket
          email
          username
          avatar
        }
        tournament {
          id
          name
          end_time
          is_default
          is_finished
          option_trade
          organizer
          start_time
          product_type
          status
          total_reward
          created_at
          updated_at
          rewards {
            id
            name
            amount
            value
          }
        }
      }
    } 
  }
  `

//req: user_id,tournament_id
module.exports = (user_id) => new Promise(async (resolve, reject) => {
  try {

    const pubChannel = messageBroker.getPublishChannel()

    //lấy balance mặc định theo tournament
    const time = new Date().toISOString()
    const tournament_result = await handle_hasura({time}, GET_TOURNAMENT)

    const tournament_list = tournament_result.data.tournament
    const handle_margin_level_list = []
    const demo_account_object = tournament_list.map(tournament => {
        const {id: tournament_id, option_trade, product_type} = tournament

        if(option_trade == OPTION_FOREX_TRADE){
          const PRICE_TYPE = PRICE_OBJECT[product_type]
          const handle_margin_level = {
            user_tournament_list: [{user_id, tournament_id}],
            price_type: PRICE_TYPE,
            check_user_info: true
          }

          handle_margin_level_list.push(handle_margin_level)

        }
        const variable  = {
          user_id,
          tournament_id,
          balance: DEFAULT_BALANCE
        }
        return variable
    })

    const variables = {
      demo_account_object
    }

    let result = await handle_hasura(variables, JOIN_TOURNAMENT)

    for(var i = 0; i < handle_margin_level_list.length; i ++){
      const data_handle_margin_level = handle_margin_level_list[i]
      await pubChannel.publish(
        EXCHANGE_LOGIC_SERVICE,
        'data.handling-margin.order',
        Buffer.from(JSON.stringify(data_handle_margin_level))
      )
    }
    

    return resolve(result)
  } catch (err) {
    console.error(err)
    return reject('tham gia giải đấu demo không thành công')
  }
})