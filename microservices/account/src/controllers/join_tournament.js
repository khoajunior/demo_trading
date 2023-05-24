const handle_hasura = require('../helpers/handler_hasura')
const { EXCHANGE_LOGIC_SERVICE, PRICE_OBJECT, OPTION_FOREX_TRADE, DEFAULT_BALANCE, REALTIME_DEMO_ACCOUNT } = require('../../constants/constants')
const { check_user_profile_valid } = require('../services/user')
const { get_tournament } = require('../services/tournament')
const ACTION = `Tham gia giải đấu không thành công`
const messageBroker = require('../core/message_broker')
const { redis_db } = require('../core/redis_db')


const JOIN_TOURNAMENT = `mutation MyMutation($user_id:uuid, $tournament_id:uuid, $ticket: Int,$balance: float8) {
  update_user_profile(where: {id: {_eq: $user_id}}, _set: {ticket: $ticket}) {
    returning {
      id
      name
      ticket
      email
      username
      avatar
    }
  }
  
  insert_demo_account(objects: {user_id: $user_id, tournament_id: $tournament_id, balance:$balance }) {
      returning {
        id
        balance
        user_profile {
          id
          name
          ticket
          email
          username
          avatar
        }
        tournament {
          id
          name
          end_time
          is_default
          is_finished
          option_trade
          organizer
          start_time
          product_type
          status
          total_reward
          created_at
          updated_at
          rewards {
            id
            name
            amount
            value
          }
        }
      }
    } 
  }
  `

//req: user_id,tournament_id
module.exports = async (req, res) => {
  try {
    const session_variables = req.body.session_variables
    const user_id = session_variables['x-hasura-user-id']
    const { tournament_id } = req.body.input
    const pubChannel = messageBroker.getPublishChannel()

    const user = await check_user_profile_valid(user_id)

    //lấy balance mặc định theo tournament
    const time = new Date().toISOString()
    const { default_balance, start_time, product_type, option_trade } = await get_tournament({ tournament_id, time })

    const user_ticket = user.ticket
    if (user_ticket == 0) {
      return res.status(400).json({
        code: `not_enough_ticket`,
        message: `${ACTION}: Bạn không đủ vé tham gia`
      })
    }

    const variables = {
      user_id,
      tournament_id,
      balance: default_balance,
      ticket: user_ticket - 1
    }

    let result = await handle_hasura(variables, JOIN_TOURNAMENT)

    const user_tournament_list = [{
      user_id,
      tournament_id
    }]
    const PRICE_TYPE = PRICE_OBJECT[product_type]

    await pubChannel.publish(
      EXCHANGE_LOGIC_SERVICE,
      'data.handling-margin.order',
      Buffer.from(JSON.stringify({
        user_tournament_list,
        price_type: PRICE_TYPE,
        check_user_info: true
      }))
    )

    return res.send({ status: 200, message: 'Handle success', data: result.data.insert_demo_account.returning[0] })
  } catch (err) {
    console.error(err)
    return res.status(400).json({
      code: `handle_fail`,
      message: `${ACTION}: ${err}`
    })
  }
}