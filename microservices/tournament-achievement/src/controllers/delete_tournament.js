const messageBroker = require('../core/message_broker')
const {TOURNAMENT_DELETE_STATUS, EXCHANGE_LOGIC_SERVICE, PRICE_OBJECT} = require('../../constants/constants')
const {update_status_delete_tournament} = require('../services/tournament')
const get_order_forex_list = require('../services/get_order_forex_list')
const {get_user_profile} = require('../helpers/get_user_profiles_hasura')

module.exports = async (req, res) => {
  try{

    const {tournament_id} = req.body.input

    const {session_variables} = req.body
    const user_id = session_variables['x-hasura-user-id']
    const user_role = session_variables['x-hasura-role']
    const {brand_id} = await get_user_profile(user_id)

    const item = {
      user_role,
      brand_id,
      status:  TOURNAMENT_DELETE_STATUS,
      user_id,
      tournament_id_list: [tournament_id]
    }

    const tournament_deleted = await update_status_delete_tournament(item)

    if(tournament_deleted.length == 0){
      return res.status(400).json({
        code: `tournament_not_found`,
        message: `Không tìm thấy giải đấu`
      })
    }

    const order_list = await get_order_forex_list(item)
    const {product_type} =  tournament_deleted[0]
    const price_type = PRICE_OBJECT[product_type]
 
    if(order_list.length > 0){
      const pubChannel = messageBroker.getPublishChannel()

      pubChannel.publish(EXCHANGE_LOGIC_SERVICE,
        'data.delete-tournament.handler',
        Buffer.from(JSON.stringify({
          order_list,
          price_type,
        }))
      )
    }
    
    return res.json({status: 200, message: 'delete tournament success', data: tournament_deleted})

  }catch(err){
    console.error(err)
    return res.status(400).json({
      code: `handle_fail`,
      message: `${err}`
    })

  }
}