const handler_hasura = require('../helpers/handler_hasura')
const format_end_time = require('../helpers/format_end_time')
const get_balance = require('./get_balance')
const check_time_for_order = require('../helpers/check_time_for_order')
const { MINIMUM_AMOUNT_ASSET } = require('../../constants/constants')

const CREATE_DEMO_HISTORY = `mutation MyMutation($end_time: timestamptz!, $investment: float8!, $open_price: float8!, $asset: String!, $start_time: timestamptz!, $user_id: uuid!, $type: Int!, $new_balance: float8!, $tournament_id: uuid, $counter_time: Int!,$ip: String) {
  insert_demo_history_binary(objects: {end_time: $end_time, investment: $investment, open_price: $open_price, asset: $asset, start_time: $start_time, user_id: $user_id, type: $type, tournament_id: $tournament_id, counter_time: $counter_time, IP: $ip}) {
    returning {
      IP
      asset
      close_price
      created_at
      end_time
      id
      equity
      investment
      is_checked
      open_price
      percent_profit_loss
      start_time
      total_profit_loss
      type
      updated_at
      counter_time
      user_id
      user_profile {
        demo_accounts(where: {tournament_id: {_eq: $tournament_id}}) {
          id
          balance
          tournament_id
        }
      }
    }
  }
  update_demo_account(where: {user_id: {_eq: $user_id}, tournament_id: {_eq: $tournament_id}}, _set: {balance: $new_balance}) {
    returning {
      balance
      id
    }
  }
}
`

//Input: user_id,asset,investment,type,exp_time,open_price,tournament_id
module.exports = (item) => new Promise(async(resolve, reject) => {
    // console.log(`service create binary order`)
    try {
        // EXP_TIME 5 or 3, 1 minute from create 
        const {
            user_id,
            asset,
            investment,
            type,
            exp_time,
            open_price,
            tournament_id,
            ip
        } = item

        if (!exp_time || exp_time <= 0) {
            return reject(`exp_time: ${exp_time} is invalid`)
        }

        // only create order when time is not expire time
        await check_time_for_order(exp_time)

        //Kiểm tra quantity so với khối lượng lệnh cho phép nhỏ nhất của asset
        if (MINIMUM_AMOUNT_ASSET[asset] && investment < MINIMUM_AMOUNT_ASSET[asset]) {
            return reject(`Khối lượng lệnh tối thiểu của ${asset}: ${MINIMUM_AMOUNT_ASSET[asset]}`)
        }

        const balance = await get_balance({
            user_id,
            tournament_id
        })

        if (investment > balance) {
            // return reject('balance is not enough')
            return reject('Số dư của bạn không đủ để đặt lệnh')
        }

        const new_balance = balance - investment
        const end_time = await format_end_time(exp_time)
            // console.log({exp_time})

        var variables = {
            user_id,
            asset,
            investment,
            type,
            start_time: new Date().toISOString(),
            end_time,
            open_price,
            new_balance,
            tournament_id,
            counter_time: exp_time,
            ip
        }

        const result = await handler_hasura(variables, CREATE_DEMO_HISTORY)
        const new_order = result.data.insert_demo_history_binary.returning[0]
        const demo_account = result.data.update_demo_account.returning[0]

        return resolve({ new_order, demo_account })

    } catch (error) {
        console.log(error)
        return reject(error)
    }
})