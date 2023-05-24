const { remove_user_from_tournament} = require('../services/tournament')
const messageBroker = require('../core/message_broker')
const { EXCHANGE_LOGIC_SERVICE } = require('../../constants/constants')
const ACTION = 'Rời khỏi giải đấu không thành công'


module.exports = async (req, res) => {
  try {

    const { session_variables } = req.body
    const user_id = session_variables['x-hasura-user-id']

    // const item = req.body.input
    // item.user_id = user_id

    // // order_item ={order_list, price_type}
    // const order_item = await remove_user_from_tournament(item)

    // const pubChannel = messageBroker.getPublishChannel()

    // const {order_list} = order_item

    // // check if 
    // if(order_list && order_list.lenth > 0){
    //   await pubChannel.publish(
    //     EXCHANGE_LOGIC_SERVICE,
    //     'data.pending-active-order.removing',
    //     Buffer.from(JSON.stringify(order_item))
    //   )
    // }

    // const user_tournament = {
    //   user_id,
    //   tournament_id: item.tournament_id
    // } 
    // await pubChannel.publish(
    //   EXCHANGE_LOGIC_SERVICE,
    //   'data.handling-margin.removing',
    //   Buffer.from(JSON.stringify({
    //     user_tournament_list: [user_tournament],
    //     price_type: order_item.price_type,
    //     handle_leave_tournament: true
    //   }))
    // )
    
    return res.json({status: 200, message: 'handler success', data: true})

  } catch (error) {
    console.log(error)

    var err = error
    if (error.message) {
      err = error.message
    }
    return res.status(400).json({
      code: "handle_fail",
      message: `${ACTION}: ${err}`,
    })
  }
}