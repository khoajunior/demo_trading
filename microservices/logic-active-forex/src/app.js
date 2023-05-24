const rabbitConf = require('./core/rabbit_config')
const messageBroker = require('./core/message_broker')
const { RABBIT_URL, PRICE_TYPE } = require('../constants/constants')
const { amqpDefinitions } = require('../constants/default')
const close_order_active = require('./controllers/close_order_active')
const redis_db = require('./core/redis_db')
const sentry = require('./core/sentry')
const cron = require('node-cron')
const chunk_time_schedule = require('../src/helpers/chunk_time_schedule')

const start = async () => {
    try {
        sentry.init()
        redis_db.connect()
        await rabbitConf.connect(RABBIT_URL)

        await messageBroker.init(
            rabbitConf.connection(),
            amqpDefinitions
        )

        const time_interval = chunk_time_schedule()
        cron.schedule(time_interval, () => {
            close_order_active()
        })


    } catch (error) {
        console.log(error)
    }
}

start()