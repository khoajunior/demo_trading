const handler_hasura = require('../helpers/handler_hasura')
const { update_balance } = require('./support_handler')


const STOP_ORDER = `mutation MyMutation($id: uuid, $end_time: timestamptz, $close_price: float8, $gross_profit_loss: float8, $net_profit_loss: float8, $swap: float8, $updated_at: timestamptz, $status_list: [Int!], $set_status: Int, $tournament_id: uuid!,$balance: float8,$user_id: uuid!) {
  update_demo_history_forex(where: {_and: {id: {_eq: $id}, status: {_in: $status_list}}}, _set: {end_time: $end_time, close_price: $close_price, swap: $swap, gross_profit_loss: $gross_profit_loss, net_profit_loss: $net_profit_loss, status: $set_status, updated_at: $updated_at}) {
    returning {
      id
      count_id
      asset
      quantity
      leverage
      type
      dividends
      open_price
      close_price
      start_time
      end_time
      status
      pending_price
      take_profit
      stop_loss
      swap
      gross_profit_loss
      net_profit_loss
      user_id
      user_profile {
        id
        name
      }
      created_at
      updated_at
      tournament_id
    }
  }
  update_demo_account(where: {user_id: {_eq: $user_id}, tournament_id: {_eq: $tournament_id}}, _inc: {balance: $balance}, _set: {updated_at: $updated_at}) {
          returning {
            user_id
            balance
            created_at
            id
            tournament_id
            updated_at
          }
        }        
}`;

//puporse: stop order
//input: id, end_time,close_price,swap(tạm thời auto = 0),gross_profit_loss, net_profit_loss
//output: update order and balance of user
module.exports = (item, status_list = [3]) => new Promise(async(resolve, reject) => {
    console.log("Stop order_id: " + item.id)
    try {
        const id = item.id
        const close_price = item.close_price || null
        var net_profit_loss = item.net_profit_loss || 0
        var gross_profit_loss = item.gross_profit_loss || net_profit_loss

        // myself
        const swap = item.swap || 0

        let variables = {
            id: id,
            end_time: new Date().toISOString(),
            close_price: close_price,
            swap: swap,
            gross_profit_loss: gross_profit_loss,
            net_profit_loss: net_profit_loss,
            status_list,
            set_status: 4,
            updated_at: new Date().toISOString(),
            user_id: item.user_id,
            balance: net_profit_loss,
            tournament_id: item.tournament_id
        };

        const result = await handler_hasura(variables, STOP_ORDER)
        let item_result = result.data.update_demo_history_forex.returning

        if (!item_result || item_result.length == 0) {
            return reject("not found order to stop")
        }

        item_result[0].demo_account = result.data.update_demo_account.returning[0]

        console.log(`order stop ${id}`)
        return resolve(item_result[0])
    } catch (err) {
        console.error(err)
        return reject(err)
    }
})