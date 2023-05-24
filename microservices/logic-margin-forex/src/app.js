const rabbitConf = require('./core/rabbit_config')
const messageBroker = require('./core/message_broker')
const { RABBIT_URL } = require('../constants/constants')
const { amqpDefinitions } = require('../constants/default')
const redis_db = require('./core/redis_db')
const postgres = require('./core/postgres')
const handler_margin = require('./controllers/handler_margin')
const sentry = require('./core/sentry')
const cron = require('node-cron')
const chunk_time_schedule = require('../src/helpers/chunk_time_schedule')

const start = async() => {
    console.log(`Start in online margin`)
    try {
        sentry.init()
        redis_db.connect()
        await postgres.connect()

        await rabbitConf.connect(RABBIT_URL)

        await messageBroker.init(
            rabbitConf.connection(),
            amqpDefinitions
        )

        const time_interval = chunk_time_schedule()
        cron.schedule(time_interval, () => {
            handler_margin()
        })

    } catch (error) {
        console.log(error)
    }
}

start()