const handler_hasura = require('../helpers/handler_hasura')
const { STATUS_ACTIVE, TYPE_BUY, STATUS_CLOSE, MIN_TIME_CLOSE_ORDER } = require('../../constants/constants')
const get_list_order = require('./get_list_order')


//item: user_id, id_list,tournament_id
module.exports = (item, price_object) => new Promise(async (resolve, reject) => {
  console.log('Service stop_active_order_list')
  try {
    const { user_id, id_list } = item
    item.id = id_list
    item.status = STATUS_ACTIVE


    const min_time_order = new Date(new Date().getTime() - MIN_TIME_CLOSE_ORDER).toISOString()
    item.min_time_order = min_time_order
    const list_order = await get_list_order(item)


    var mutation_sentence = ``
    var index = 1;
    list_order.forEach(element => {
      const { id, open_price, fn_net_profit_loss, type, asset } = element
      const price = JSON.parse(price_object[asset])

      var close_price = price.ask //SELL
      if (type === TYPE_BUY) {
        close_price = price.bid
      }

      var net_profit_loss = fn_net_profit_loss * (close_price - open_price);
      var end_time = new Date().toISOString()

      const mutation_item = `
                    A${index}: update_demo_history_forex(where: { 
                      status: {_eq: ${STATUS_ACTIVE}}, 
                      id: {_eq: "${id}"},
                      tournament_id: {_eq: "${item.tournament_id}"}
                  },
                  _set: {
                    status: ${STATUS_CLOSE}, 
                    close_price: ${close_price},
                    net_profit_loss: ${net_profit_loss},
                    gross_profit_loss: ${net_profit_loss},
                    end_time: "${end_time}",
                    updated_at: "${end_time}"
                  }) 
                  {
                    returning {
                      id
                      count_id
                      asset
                      quantity
                      leverage
                      type
                      dividends
                      open_price
                      close_price
                      start_time
                      end_time
                      status
                      pending_price
                      take_profit
                      stop_loss
                      swap
                      gross_profit_loss
                      net_profit_loss
                      user_id
                      user_profile {
                        id
                        name
                      }
                      created_at
                      updated_at
                      fn_net_profit_loss
                    }
                  },

                  B${index}:update_demo_account(where: {
                    user_id: {_eq: "${user_id}"}, 
                    tournament_id: {_eq: "${item.tournament_id}"}
                  }, 
                  _inc: {balance: ${net_profit_loss}}) {
                    returning {
                      user_id
                      balance      
                    }
                  },
                  `
      mutation_sentence += mutation_item
      index++
    })

    var result = []
    if (mutation_sentence.length > 1) {
      const STOP_ACTIVE_ORDERS = `mutation MyMutation { ${mutation_sentence} }`
      const response = await handler_hasura(null, STOP_ACTIVE_ORDERS)
      for (var i = 1; i < index; i++) {
        var key = `A${i}`
        result.push(...response.data[key].returning)
      }
    }
    return resolve(result)
  } catch (err) {
    console.error(err)
    return reject(err)
  }
})