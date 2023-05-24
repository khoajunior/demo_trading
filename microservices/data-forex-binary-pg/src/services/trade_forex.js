const handler_hasura = require('../helpers/handler_hasura')
const { STATUS_CLOSE, STATUS_ACTIVE } = require('../../constants/constants')

const stop_order = (item, status_list = [3]) => new Promise(async(resolve, reject) => {
    try {
        const { id_list, close_price, end_time } = item

        const update_mutation = `mutation MyMutation($id_list: [uuid!], $end_time: timestamptz, $close_price: float8, $set_status: Int, $status_list: [Int!], $updated_at: timestamptz) {
          update_demo_history_forex(where: {_and: {id: {_in: $id_list}, status: {_in: $status_list}}}, _set: {end_time: $end_time, close_price: $close_price, status: $set_status, updated_at: $updated_at}) {
            returning {
              id
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
              created_at
              updated_at
              tournament {
                created_at
                end_time
                id
                name
                organizer
                start_time
                updated_at
              }
              tournament_id
            }
          }
        }`;

        let variables = {
            id_list,
            end_time,
            updated_at: new Date().toISOString(),
            close_price,
            status_list,
            set_status: STATUS_CLOSE,
        };

        const result = await handler_hasura(variables, update_mutation)

        // console.log({erere: result.data.update_demo_history_forex.returning[0]})
        const item_result = result.data.update_demo_history_forex.returning

        if (!item_result || item_result.length == 0) {
            return reject("not found order to stop")
        }
        return resolve(true)
    } catch (err) {
        return reject(err)
    }
})

const update_pending_to_active = (data) => new Promise(async(resolve, reject) => {
    console.log("update active order_id: " + data.id)
        // console.log({ data })
    try {
        const { id_list, open_price, start_time } = data
        const my_mutation = `mutation MyMutation($id: uuid, $start_time: timestamptz, $open_price: float8, $updated_at: timestamptz) {
          update_demo_history_forex(where: {id: {_eq: $id}}, _set: {status: 3, start_time: $start_time, open_price: $open_price, updated_at: $updated_at}) {
            returning {
              id
              quantity
              type
              asset
              pending_price
              take_profit
              stop_loss
              status
              user_id
              margin
              start_time
              open_price
              updated_at
              tournament {
                created_at
                end_time
                id
                name
                organizer
                start_time
                updated_at
              }
              tournament_id
              fn_net_profit_loss
            }
          }
        }`
        let variables = {
            id_list,
            start_time,
            open_price,
            updated_at: new Date().toISOString(),
            set_status: STATUS_ACTIVE
        }

        await handler_hasura(variables, my_mutation)
        console.log(`order ${id}: pending -> active`)
        return resolve(true)

    } catch (err) {
        return reject(err)
    }
})

const stop_order_pending_list = (data) => new Promise(async(resolve, reject) => {
    console.log(`stop_order_pending_list`)
    try {
        const { user_id, tournament_id } = data
        const update_mutation = `mutation MyMutation($user_id: uuid, $end_time: timestamptz, $updated_at: timestamptz, $tournament_id: uuid) {
          update_demo_history_forex(where: {status: {_eq: 2}, user_id: {_eq: $user_id}, tournament_id: {_eq: $tournament_id}}, _set: {end_time: $end_time, close_price: 0, swap: 0, gross_profit_loss: 0, net_profit_loss: 0, status: 5, updated_at: $updated_at}) {
            returning {
              id
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
              created_at
              updated_at
              tournament {
                created_at
                end_time
                id
                name
                organizer
                start_time
                updated_at
              }
              tournament_id
            }
          }
        }`;
        let variables = {
            user_id: user_id,
            end_time: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            tournament_id,
        };
        const result = await handler_hasura(variables, update_mutation)
            // console.log(`order  stop`)
        return resolve(result.data.update_demo_history_forex.returning)
            // return resolve("Update order successfully")
    } catch (err) {
        return reject(err)
    }
})

module.exports = {
    stop_order,
    update_pending_to_active,
    stop_order_pending_list
}