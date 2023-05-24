const handler_hasura = require('../helpers/handler_hasura')
const GET_TOURNAMENT = `query MyQuery($tournament_id: [uuid!]) {
    tournament(where: {id: {_in: $tournament_id}}) {
      id
      name
      start_time
      end_time
      organizer
      total_reward
      created_at
      updated_at
      is_finished
      option_trade
      status
      updated_by
      product_type
    }
  }
  `

module.exports = (tournament_id) => new Promise(async(resolve, reject) => {
    try {
        const variables = { tournament_id }

        const result = await handler_hasura(variables, GET_TOURNAMENT)

        if (result.data.tournament.length == 0) {
            return reject(`Không tìm thấy giải đấu`)
        }
        return resolve(result.data.tournament)
    } catch (err) {
        console.log({err})
        return reject(`Tìm giải đấu thất bại`)
    }
})