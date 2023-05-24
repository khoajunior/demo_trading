const cron = require('node-cron')
const { STATUS_ACTIVE, TOURNAMENT_ACTIVE_STATUS, SWAP_DAYS, TYPE_BUY, TYPE_SELL, PRICE_OBJECT } = require('../../constants/constants')
const handle_hasura = require('../helpers/handler_hasura')
const change_balance_for_handling_margin_to_redis = require('./change_balance_for_handling_margin_to_redis.js')
const convert_to_usd = require('../helpers/convert_to_usd')

const GET_ORDER_ACTIVE = `query MyQuery($tournament_status: Int, $current_time: timestamptz, $product_type: Int, $status: Int) {
  demo_history_forex(where: {tournament: {status: {_eq: $tournament_status}, start_time: {_lte: $current_time}, product_type: {_eq: $product_type}, end_time: {_gt: $current_time}}, status: {_eq: $status}}) {
    asset
    id
    swap
    close_price
    count_id
    created_at
    dividends
    assetByAsset {
      buy_swap
      created_at
      id
      name
      scale_percent
      sell_swap
      swap_id
      updated_at
      standard_volume
    }
    open_price
    quantity
    tournament_id
    user_id
    status
    margin
    leverage
    pending_price
    stop_loss
    type
  }
}`

const UPDATE_BALANCE = `mutation MyMutation($tournament_id: uuid, $user_id: uuid, $balance: float8, $current_time: timestamptz) {
  update_demo_account(where: {tournament_id: {_eq: $tournament_id}, user_id: {_eq: $user_id}}, _inc: {}, _set: {balance: $balance, updated_at: $current_time}) {
    returning {
      balance
      created_at
      id
      reward_id
      total_margin
      tournament_id
      updated_at
      user_id
    }
  }
}
`

const GET_BALANCE = `query MyQuery ($tournament_id: uuid, $user_id: uuid){
  demo_account(where: {tournament_id: {_eq: $tournament_id}, user_id: {_eq: $user_id}}) {
    balance
    id
    total_margin
    tournament_id
    updated_at
    user_id
  }
}
`

const UPDATE_ORDER_CFD_SWAP = `mutation MyMutation($id: uuid, $swap: float8, $current_time: timestamptz) {
  update_demo_history_forex(where: {id: {_eq: $id}}, _inc: {swap: $swap}, _set: {updated_at: $current_time}) {
    returning {
      asset
      close_price
      count_id
      dividends
      id
      swap
      tournament_id
      transaction_type
      type
      updated_at
      user_id
    }
  }
}
`

module.exports = async (product_type) => {
  try {
    const demo_account = {}

    const variables = {
      product_type,
      tournament_status: TOURNAMENT_ACTIVE_STATUS,
      current_time: new Date().toISOString(),
      status: STATUS_ACTIVE
    }
    const result = await handle_hasura(variables, GET_ORDER_ACTIVE)

    const orders = result.data.demo_history_forex

    for (var i = 0; i < orders.length; i++) {
      try {
        const { open_price, quantity, tournament_id, user_id, assetByAsset, type, id, asset} = orders[i]
        const key = `${tournament_id}/${user_id}`
        // console.log({ order: orders[i] })

        if (!demo_account[key]) {
          demo_account[key] = 0
        }
        const { standard_volume, sell_swap, buy_swap } = assetByAsset
        var swap_percent = sell_swap

        if (type == TYPE_BUY) {
          swap_percent = buy_swap
        }
        const PRICE_TYPE = PRICE_OBJECT[product_type]
        const format_open_price = convert_to_usd(open_price, asset, PRICE_TYPE)

        const swap_fee = quantity * standard_volume * format_open_price * swap_percent / (SWAP_DAYS * 100)


        const update_order_cfd_variables = {
          id,
          swap: swap_fee,
          current_time: new Date().toISOString()
        }
        const update_order_cfd = await handle_hasura(update_order_cfd_variables, UPDATE_ORDER_CFD_SWAP)
        demo_account[key] += swap_fee

      } catch (error) {
        console.log(error)
      }
    }

    const user_touranament_list = Object.keys(demo_account)

    for(var j = 0; j < user_touranament_list.length; j ++){
      const user_touranment = user_touranament_list[j]
      const total_swap_fee = demo_account[user_touranment]

      const tournament_id = user_touranment.split('/')[0]
      const user_id = user_touranment.split('/')[1]

      const variable_balance = {
        tournament_id,
        user_id
      }
      const balance_result = await handle_hasura(variable_balance, GET_BALANCE)

      var {balance} = balance_result.data.demo_account[0]


      balance = balance + total_swap_fee

      if(balance < 0){
        balance = 0
      }

      const update_balance = {
        tournament_id,
        user_id,
        balance,
        current_time: new Date().toISOString()
      }

      // console.log({balance, total_swap_fee})
      await handle_hasura(update_balance, UPDATE_BALANCE)

      update_balance.price_type = PRICE_TYPE

      await change_balance_for_handling_margin_to_redis(update_balance)
    }

  } catch (error) {
    console.log(error)
  }
}