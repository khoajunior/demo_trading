const handler_hasura = require('../helpers/handler_hasura')
const { STATUS_PENDING } = require('../../constants/constants')

const UPDATE_ORDER = `mutation MyMutation($id: uuid,$user_id:uuid, $end_time: timestamptz, $updated_at: timestamptz, $status: Int, $tournament_id: uuid) {
  update_demo_history_forex(where: {
      id: {_eq: $id}, 
      status: {_eq: $status}, 
      user_id: {_eq: $user_id},
      tournament_id: {_eq: $tournament_id}
  },
  _set: {
      end_time: $end_time, 
      close_price: 0, 
      swap: 0, 
      gross_profit_loss: 0, 
      net_profit_loss: 0, 
      status: 5, 
      updated_at: $updated_at
  }) 
  {
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
        name
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
      created_at
      updated_at
    }
  }
}
  `;

//Input: user_id,tournament_id,id: id of order
module.exports = (item) => new Promise(async(resolve, reject) => {
    console.log("Stop pending order_id: " + item.id)
    try {
        let variables = {
            id: item.id,
            user_id: item.user_id,
            tournament_id: item.tournament_id,
            end_time: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            status: STATUS_PENDING
        };
        const result = await handler_hasura(variables, UPDATE_ORDER)
        const order = result.data.update_demo_history_forex.returning[0]

        if (!order) {
            return reject(`pending order ${item.id} in tournament ${item.tournament_id} not found`)
        }

        // console.log(`order ${id} stop`)
        return resolve(order)
    } catch (err) {
        console.log(`err in stop pending order`, err)
        return reject(err)
    }
})