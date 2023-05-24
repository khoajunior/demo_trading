const handler_hasura = require('../helpers/handler_hasura')


const CLOSE_BINARY = `mutation MyMutation($id: uuid, $is_checked: Boolean, $close_price: float8, $equity: float8, $percent_profit_loss: float8, $updated_at: timestamptz, $total_profit_loss: float8, $tournament_id: uuid) {
  update_demo_history_binary(where: {id: {_eq: $id}, tournament_id: {_eq: $tournament_id}}, _set: {is_checked: $is_checked, close_price: $close_price, equity: $equity, percent_profit_loss: $percent_profit_loss, updated_at: $updated_at, total_profit_loss: $total_profit_loss}) {
    returning {
      asset
      close_price
      created_at
      end_time
      equity
      id
      investment
      is_checked
      open_price
      percent_profit_loss
      start_time
      total_profit_loss
      type
      updated_at
      user_id
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
}

  `

module.exports = (item) => new Promise(async(resolve, reject) => {
    console.log(`function stop banary`)
    try {
        const variables = {
                close_price: item.close_price,
                updated_at: item.updated_at,
                total_profit_loss: item.total_profit_loss,
                percent_profit_loss: item.percent_profit_loss,
                is_checked: item.is_checked,
                equity: item.equity,
                id: item.id,
                tournament_id: item.tournament_id
            }

        const result = await handler_hasura(variables, CLOSE_BINARY)
        const close_order = result.data.update_demo_history_binary.returning[0]

        return resolve(close_order)

    } catch (error) {
        console.log(error)
        return reject(error)
    }
})