const handle_hasura = require('../helpers/handler_hasura')
const { STATUS_ACTIVE, STATUS_PENDING, TOURNAMENT_DELETE_STATUS, PRICE_OBJECT, REALTIME_DEMO_ACCOUNT, OPTION_BINARY_TRADE } = require('../../constants/constants')
const {redis_db} = require('../core/redis_db')


const USER_IN_TOURNAMENT = `query MyQuery ($user_id: uuid!, $tournament_id: uuid!, $status_list: [Int!]){
  demo_history_forex(where: {user_id: {_eq: $user_id}, tournament_id: {_eq: $tournament_id}, status: {_in: $status_list}}) {
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
  demo_account(where: {user_id: {_eq: $user_id}, tournament_id: {_eq: $tournament_id}}) {
    balance
    created_at
    id
    rank
    reward_id
    tournament_id
    updated_at
    user_id
    tournament {
      id
      product_type
      name
    }
  }
}
`


const REMOVE_USER_FROM_TOURNAMENT = `mutation MyMutation ($user_id: uuid!, $tournament_id: uuid!, $ticket: Int){
  delete_demo_history_forex(where: {user_id: {_eq: $user_id}, tournament_id: {_eq: $tournament_id}}) {
    affected_rows
    returning {
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
  delete_demo_history_binary(where: {user_id: {_eq: $user_id}, tournament_id: {_eq: $tournament_id}}) {
    affected_rows
  }
  delete_demo_account(where: {user_id: {_eq: $user_id}, tournament_id: {_eq: $tournament_id}}) {
    returning {
      balance
      created_at
      id
      rank
      reward_id
      tournament_id
      updated_at
      user_id
    }
  }
}`

const GET_TOURNAMENT = `query MyQuery($tournament_id: uuid!, $time: timestamptz) {
  tournament(where: {id: {_eq: $tournament_id}, end_time: {_gt: $time}, status: {_neq: ${TOURNAMENT_DELETE_STATUS}}}) {
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

const remove_user_from_tournament = (item) => new Promise(async(resolve, reject) => {
    try {
        const { user_id, tournament_id } = item

        //check user in tournament
        var variables = {
            user_id,
            tournament_id,
            status_list: [STATUS_ACTIVE, STATUS_PENDING]
        }

        const check_user_demo = await handle_hasura(variables, USER_IN_TOURNAMENT)

        const existed_user_tourmanet = check_user_demo.data.demo_account
        if (existed_user_tourmanet.length == 0) {
            return reject(`user ${user_id} had not yet joined in tournament ${tournament_id}`)
        }

        const forex_order_list = check_user_demo.data.demo_history_forex
        const { product_type, option_trade} = existed_user_tourmanet[0].tournament



        variables = {
            user_id,
            tournament_id
        }


        const user_tournament_result = await handle_hasura(variables, REMOVE_USER_FROM_TOURNAMENT)
        
        if(option_trade == OPTION_BINARY_TRADE){
          return resolve({order_list: []})
        }
        const price_type = PRICE_OBJECT[product_type]
        const key = `${price_type}/${user_id}/${tournament_id}`
        await redis_db.hmdelAsync(REALTIME_DEMO_ACCOUNT, key)

        //return all order active and pending for remove from redis
        return resolve({ order_list: forex_order_list, price_type })

    } catch (error) {
        console.log(error)
        return reject(error)
    }
})

const get_tournament = (item) => new Promise(async(resolve, reject) => {
    try {
        const { time, tournament_id } = item
        let time_input = time || '3000-01-01'
        const variables = { tournament_id, time: time_input }

        const result = await handle_hasura(variables, GET_TOURNAMENT)

        if (result.data.tournament.length == 0) {
            return reject(`Tournament ${tournament_id} not found or finished or inactive`)
        }
        return resolve(result.data.tournament[0])
    } catch (err) {
        return reject(err)
    }
})

module.exports = {
    remove_user_from_tournament,
    get_tournament
}