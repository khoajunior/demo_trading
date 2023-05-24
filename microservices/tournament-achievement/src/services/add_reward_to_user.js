const handle_hasura = require('../helpers/handler_hasura')

const GET_REWARD_TOURNAMENT = `query MyQuery($tournament_id: uuid) {
  reward(where: {tournament: {id: {_eq: $tournament_id}, is_finished: {_eq: true}}}, order_by: {level: asc}) {
    id
    name
    value
    level
    amount
    tournament {
      id
      name
      end_time
    }
  }
}  `

module.exports = (item) => new Promise(async(resolve, reject) => {
    try {
        const { tournament_id } = item

        let variables = {
            tournament_id
        }
        const list_reward = await handle_hasura(variables, GET_REWARD_TOURNAMENT)
        if (list_reward.data.reward.length == 0) {
            return reject(`Giải đấu không có giải  thưởng hoặc chưa kết thúc`)
        }

        let list_reward_id = []
        let list_reward_amount = []
        list_reward.data.reward.forEach(item => {
                list_reward_id.push(item.id)
                list_reward_amount.push(item.amount)
        })

        let index = 0;
        let sentence_mutation = `mutation MyMutation { `

        //create sentence mutation for update
        for (var i = 0; i < list_reward_id.length; i++) {
            const reward_item = list_reward_id[i]
            const rank_item = index + list_reward_amount[i]

            const sentence_item = `
            A${i}: update_demo_account(where: {tournament_id: {_eq: "${tournament_id}"}, rank: {_gt: ${index}, _lte: ${rank_item}}}, _set: {reward_id: "${reward_item}"}) {
                returning {
                  id
                  user_id
                  balance
                  tournament_id
                  reward_id
                }
              }`

            sentence_mutation += sentence_item
            index += list_reward_amount[i]
        }

        sentence_mutation += `}`

        const result = await handle_hasura(null, sentence_mutation)

        return resolve(result)
    } catch (err) {
        console.log({err})
        return reject(`Trao giải cho người chơi thất bại`)
    }
})