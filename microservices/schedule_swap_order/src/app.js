const cron_order_swap = require('../src/services/cron_order_swap')
const { COMMODITY_TYPE, FOREX_TYPE, CRYPTO_TYPE, TURN_ON_SCHEDULE_HANDLING_SWAP } = require('../constants/constants')
const redis_server = require('./core/redis_db')
const sentry = require('./core/sentry')
const cron = require('node-cron')

const start = async () => {
  sentry.init()

  //connect redis
  // console.log(process.env.REDIS_HOST)
  await redis_server.connect()


  // if (TURN_ON_SCHEDULE_HANDLING_SWAP == 'true') {
  //   // 4h sang (thu monday to friday) vietnam => 5h sang o singapore(service in sing) => 22h in GMT
  //   cron.schedule('0 0 22 * * 1-5', async () => {
  //     // cron.schedule('*/3 * * * * *', async () => {
  //     await cron_order_swap(FOREX_TYPE)
  //   })

  //   cron.schedule('0 0 22 * * 1-5', async () => {
  //     // cron.schedule('*/3 * * * * *', async () => {
  //     await cron_order_swap(COMMODITY_TYPE)
  //   })

  //   // CRYPTO all days of week
  //   cron.schedule('0 0 22 * * *', async () => {
  //     // cron.schedule('*/3 * * * * *', async () => {
  //     await cron_order_swap(CRYPTO_TYPE)
  //   })
  // }

}

start()