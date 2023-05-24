const handler_hasura = require('./handler_hasura')
const { STATUS_ACTIVE, OPTION_BINARY_TRADE } = require('../../constants/constants')
const get_tournament_by_id = require('../services/get_tournament_by_id')

const get_user_profile = (user_id) => new Promise(async(resolve, reject) => {
    try {
        const GET_USER_PROFILE = `query MyQuery($user_id: uuid) {
            user_profile(where: {id: {_eq: $user_id}}) {
                avatar
                created_at
                email
                exp_time
                id
                level
                brand_id
                name
                role
                ticket
                updated_at
                username
                code
            }
          }
          `
        const variables = {
            user_id
        }

        const result = await handler_hasura(variables, GET_USER_PROFILE)
        if (result.data.user_profile.length == 0) {
            return reject(`Tài khoản không tồn tại`)
        }
        return resolve(result.data.user_profile[0])
    } catch (err) {
        console.error(err)
        return reject(`Lấy thông tin user không thành công`)
    }
})

const get_user_by_tournament = (tournament_id) => new Promise(async(resolve, reject) => {
    try {

        const GET_LIST_USER_TOURNAMENT = `query MyQuery($tournament_id: uuid!) {
            demo_account(where: {tournament: {id: {_eq: $tournament_id}}}) {
              tournament {
                id
                name
                option_trade
                product_type
              }
              user_profile {
                id
                name
                avatar
                email
                username
                demo_accounts(where: {tournament_id: {_eq: $tournament_id}}) {
                  id
                  balance
                  user_id
                  tournament_id
                }
                demo_history_forexes(where: {tournament_id: {_eq: $tournament_id}, status: {_eq: 3}}) {
                  id
                  asset
                  type
                  net_profit_loss
                  status
                  open_price
                  fn_net_profit_loss
                  margin
                }
                demo_history_binaries(where: {tournament: {id: {_eq: $tournament_id}}}) {
                  id
                  asset
                  type
                  total_profit_loss
                  equity
                  is_checked
                  investment
                  open_price
                }
              }
            }
          }
          
          `
        const variables = {
            tournament_id
        }

        let response = await handler_hasura(variables, GET_LIST_USER_TOURNAMENT)
        response = response.data.demo_account

        if (response == 0) {
            return reject(`Giải đấu chưa có người chơi`)
        }

        //Format data trả về,mảng object,mỗi object chỉ gồm user_info và list order user đó
        let list_user = []
        const response_tournament = await get_tournament_by_id(tournament_id)
        const { option_trade } = response_tournament[0]
        response.forEach(item => {
            const { id, name, avatar, email, username } = item.user_profile
            let list_order = item.user_profile.demo_history_forexes
            if (option_trade === OPTION_BINARY_TRADE) {
                list_order = item.user_profile.demo_history_binaries
            }
            const user = {
                    id,
                    username,
                    name,
                    avatar,
                    email,
                    balance: item.user_profile.demo_accounts[0].balance,
                    list_order,
                    tournament: item.tournament
                }
                // console.log({ user })
            list_user.push(user)
        })

        return resolve(list_user)
    } catch (err) {
        console.error(err)
        return reject(err)
    }
})

module.exports = {
    get_user_profile,
    get_user_by_tournament
}