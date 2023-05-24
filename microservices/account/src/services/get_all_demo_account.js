const handle_hasura = require('../helpers/handler_hasura')
const {TOURNAMENT_DELETE_STATUS, OPTION_FOREX_TRADE } = require('../../constants/constants')
const handler_hasura = require('../helpers/handler_hasura')

const DEMO_ACCOUNT = `query MyQuery($user_id: uuid, $status: Int, $current_time: timestamptz, $option_trade: Int) {
  demo_account(where: {user_id: {_eq: $user_id}, tournament: {status: {_neq: $status}, start_time: {_lte: $current_time}, end_time: {_gt: $current_time}, option_trade: {_eq: $option_trade}}}) {
    balance
    tournament {
      option_trade
      id
      is_finished
      is_display
      status
      product_type
    }
    user_id
    tournament_id
  }
}`
module.exports = (user_id) => new Promise(async (resolve, reject) => {
  try{

    const variables = {
      user_id,
      status: TOURNAMENT_DELETE_STATUS,
      current_time: new Date().toISOString(),
      option_trade: OPTION_FOREX_TRADE
    }
    const result = await handler_hasura(variables, DEMO_ACCOUNT)
    const demo_account_list = result.data.demo_account
    return resolve(demo_account_list)
    

  }catch(error){
    console.log(error)
    return reject('Thông tin tài khoản chơi thử không tồn tại')
  }
})