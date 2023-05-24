const rabbitConf = require('./core/rabbit_config')
const messageBroker = require('./core/message_broker')
const { RABBIT_URL, PRICE_TYPE } = require('../constants/constants')
const { amqpDefinitions } = require('../constants/default')
const update_order_pending = require('./controllers/update_order_pending')
const redis_db = require('./core/redis_db')
const sentry = require('./core/sentry')
const cron = require('node-cron')
const chunk_time_schedule = require('../src/helpers/chunk_time_schedule')

const start = async () => {
    try {
        console.log({PRICE_TYPE})
        sentry.init()
        redis_db.connect()
        await rabbitConf.connect(RABBIT_URL)

        await messageBroker.init(
            rabbitConf.connection(),
            amqpDefinitions
        )

        // messageBroker.addConsumer(
        //     `${PRICE_TYPE}_group_pending_q`,
        //     (msg) => {
        //         const content = msg.content.toString()
        //         const data = JSON.parse(content)

        //         update_order_pending(data)
        //     }, {
        //     noAck: true
        // })

        const time_interval = chunk_time_schedule()
        // console.log({time_interval})
        cron.schedule(time_interval, () => {
            // console.log(new Date().toString())
            update_order_pending()
        })

    } catch (error) {
        console.log(error)
    }
}

start()