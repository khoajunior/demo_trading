const { STATUS_PENDING } = require('../../constants/constants')
const handler_hasura = require('../helpers/handler_hasura')

const UPDATE_PENDING_ORDER = `mutation MyMutation ($id: uuid, $user_id: uuid,$tournament_id: uuid, $status: Int, $pending_price: float8, $quantity: float8, $updated_at: timestamptz!, $transaction_type: Int, $take_profit: float8, $stop_loss: float8){
  update_demo_history_forex(
    where: {
      id: {_eq: $id}, 
      status: {_eq: $status}, 
      tournament_id: {_eq: $tournament_id}, 
      user_id: {_eq:$user_id}
    } 
    _set: {
      pending_price: $pending_price, 
      quantity: $quantity, 
      updated_at: $updated_at, 
      transaction_type: $transaction_type, 
      take_profit: $take_profit, 
      stop_loss: $stop_loss
    }) 
    {
    returning {
      asset
      close_price
      created_at
      dividends
      end_time
      fn_net_profit_loss
      gross_profit_loss
      id
      count_id
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
      transaction_type
      type
      updated_at
      user_id
      tournament {
        updated_at
        start_time
        organizer
        name
        end_time
        id
        created_at
      }
      tournament_id
    }
    affected_rows
  }
}
  `

//Input: id,pending_price,stop_loss,take_profit,quantity,transaction_type,tournament_id,user_id
module.exports = (item) => new Promise(async(resolve, reject) => {

    try {

        const variables = {
            id: item.id,
            status: STATUS_PENDING,
            pending_price: item.pending_price,
            stop_loss: item.stop_loss,
            take_profit: item.take_profit,
            updated_at: new Date().toISOString(),
            quantity: item.quantity,
            transaction_type: item.transaction_type,
            tournament_id: item.tournament_id,
            user_id: item.user_id
        }

        const result = await handler_hasura(variables, UPDATE_PENDING_ORDER)
        const order = result.data.update_demo_history_forex.returning[0]

        if (!order) {
            // return reject('pending order not found')
            return reject(`Lệnh không tồn tại`)
        }

        return resolve(order)


    } catch (error) {
        console.log(error)
        return reject(error)
    }
})