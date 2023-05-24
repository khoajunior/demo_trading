const handler_hasura = require('../helpers/handler_hasura')

const UPDATE_ORDER = `mutation MyMutation($user_id: uuid, $id: uuid, $take_profit: float8, $stop_loss: float8, $updated_at: timestamptz!, $tournament_id: uuid) {
  update_demo_history_forex(
      where: {
        user_id: {_eq: $user_id}, id: {_eq: $id},
        tournament_id: {_eq: $tournament_id}
      }, 
      _set: {take_profit: $take_profit, stop_loss: $stop_loss, updated_at: $updated_at}) {
    affected_rows
    returning {
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
      end_time
      dividends
      created_at
      close_price
      asset
      user_profile {
        name
        email
        id
      }
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
  }
}
`

//Input: id,take_profit,stop_loss,user_id,tournament_id
module.exports = (item) => new Promise(async(resolve, reject) => {
    try {

        const variables = {
            id: item.id,
            take_profit: item.take_profit,
            stop_loss: item.stop_loss,
            user_id: item.user_id,
            tournament_id: item.tournament_id,
            updated_at: new Date().toISOString()
        }
        const result = await handler_hasura(variables, UPDATE_ORDER)

        if (result.data.affected_rows == 0) {
            // return reject(`order ${item.id} in tournament ${item.tournament_id} is not existed`)
            return reject(`Lệnh không tồn tại`)
        }
        const order = result.data.update_demo_history_forex.returning[0]
        return resolve(order)
    } catch (err) {
        return reject(err)
    }
})