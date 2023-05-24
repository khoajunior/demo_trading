const rabbitConf = require('./core/rabbit_config')
const messageBroker = require('./core/message_broker')
const { RABBIT_URL } = require('../constants/constants')
const { amqpDefinitions } = require('../constants/default')
const close_binary = require('./controllers/close_binary')
const redis_db = require('./core/redis_db')
const sentry = require('./core/sentry')

const start = async() => {
    console.log(`app online-binary`)
    try {
        sentry.init()
        redis_db.connect()
        await rabbitConf.connect(RABBIT_URL)

        await messageBroker.init(
            rabbitConf.connection(),
            amqpDefinitions
        )

        close_binary()
    } catch (error) {
        console.log(error)
    }
}

start()