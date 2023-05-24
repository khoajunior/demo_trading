const handler_hasura = require('../helpers/handler_hasura')

const get_rewards_by_id = (reward_id) => new Promise(async(resolve, reject) => {
    try {
        const GET_REWARD = `query MyQuery($reward_id: uuid) {
            reward(where: {id: {_eq: $reward_id}}) {
              id
              name
              tournament_id
            }
          }
          `

        const result = await handler_hasura({ reward_id }, GET_REWARD)

        if (result.data.reward.length < 1) {
            return reject(`Reward ${reward_id} not found`)
        }

        return resolve(result.data.reward[0])
    } catch (err) {
        console.log({err})
        return reject(`Lấy danh sách giải đấu không thành công`)
    }
})

module.exports = {
    get_rewards_by_id
}