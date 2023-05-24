// const messageBroker = require('../core/message_broker')
const { EMIT_CHART_REALTIME, EMIT_GET_PRICE } = require('../../constants/constants')
const get_all_current_price = require('../helpers/get_all_current_price')
const cron = require('node-cron')


module.exports = (router_chart, price_type = 'forex') => {
  cron.schedule('* * * * * *', async ()=> {
    const price_detail = await get_all_current_price(price_type)
    router_chart.to(`type/${price_type}`).emit(EMIT_GET_PRICE, price_detail)

    for(var asset in price_detail){
      const price_json = price_detail[asset]
      const price_object = JSON.parse(price_json)
      router_chart.to(`asset/${asset}`).emit(EMIT_CHART_REALTIME, price_object)
    }
  })
}