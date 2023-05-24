const handler_hasura = require('../helpers/handler_hasura')

module.exports = (user_tournament) => new Promise(async (resolve, reject) => {
  try{
    const variables = {
      tournament_id: user_tournament.tournament_id,
      user_id: user_tournament.user_id,
      current_time: new Date().toISOString()
    }

    const query = `mutation MyMutation ($tournament_id: uuid!, $user_id: uuid!, $current_time: timestamptz!){
      update_demo_account(where: {tournament_id: {_eq: $tournament_id}, user_id: {_eq: $user_id}}, 
           _set: {updated_at: $current_time, closed_order_at: $current_time}) {
        affected_rows
      }
    }
    `

    const result = await handler_hasura(variables, query)
    return resolve(result)

  }catch(error){
    console.log(error)
    return reject(error)
  }
})