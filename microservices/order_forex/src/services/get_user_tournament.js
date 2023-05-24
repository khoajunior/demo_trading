const handler_hasura = require('../helpers/handler_hasura')


const USER_TOURAMENT = `query MyQuery($user_id: uuid, $tournament_id: uuid) {
    demo_account(where: {tournament_id: {_eq: $tournament_id}, user_id: {_eq: $user_id}}) {
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
      updated_at
      user_id
      user_profile {
        created_at
        email
        id
        level
        name
        updated_at
        username
      }
      id
      created_at
      balance
    }
  }`

module.exports = (item) => new Promise(async(resolve, reject) => {
    try {

        const variables = {
            user_id: item.user_id,
            tournament_id: item.tournament_id
        }
        const result = await handler_hasura(variables, USER_TOURAMENT)
        const user_tournament = result.data.demo_account[0]
        return resolve(user_tournament)

    } catch (error) {
        console.log(error)
        return reject(error)
    }
})