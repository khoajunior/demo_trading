const handler_hasura = require('../helpers/handler_hasura')

module.exports = (item) => new Promise(async(resolve, reject) => {
    try {
        const query = `query MyQuery($user_id: uuid, $tournament_id: uuid) {
        demo_account(where: {user_id: {_eq: $user_id}, tournament_id: {_eq: $tournament_id}}) {
          balance
        }
      }`

        let variables = {
            user_id: item.user_id,
            tournament_id: item.tournament_id
        }

        const result = await handler_hasura(variables, query)
        if (result.data.demo_account.length == 0) {
            return reject(`User chưa tham gia vào giải đấu này`)
        }

        return resolve(result.data.demo_account[0].balance)

    } catch (err) {
        console.error(err)
        return reject(`user ${user_id} yet hasn't joined tournament ${tournament_id}`)
    }
});