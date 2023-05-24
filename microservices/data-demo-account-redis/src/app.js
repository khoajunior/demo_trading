const rabbitConf = require('./core/rabbit_config')
const messageBroker = require('./core/message_broker')
const { 
    RABBIT_URL, QUEUE_LISTEN_DATA, TURN_ON_SCHEDULE_FOR_CLOSED_TOURNAMENT,
    CRON_ALL_SYSTEM, CHECK_TOURNAMENT_CLOSE_OR_DELETE, HANDLE_DONE
} = require('../constants/constants')
const { amqpDefinitions } = require('../constants/default')
const socket_emit = require('./core/ws_emit')
const postgres = require('./core/postgres')
const redis_db = require('./core/redis_db')
const handle_logic = require('./handler_logic')
const cron_checking_tournament_closed = require('./controllers/cron_checking_tournament_closed')
const sentry = require('./core/sentry')
const {stop_order_pending_in_tournament_expired_or_deleted} = require('./services/trade_forex_pg')


const start = async () => {
    try {
        sentry.init()
        socket_emit.start()
        await postgres.connect()

        await redis_db.connect()

        await rabbitConf.connect(RABBIT_URL)

        await messageBroker.init(
            rabbitConf.connection(),
            amqpDefinitions
        )

        await redis_db.redis_db.hmsetAsync(CRON_ALL_SYSTEM, CHECK_TOURNAMENT_CLOSE_OR_DELETE, HANDLE_DONE)
        
        messageBroker.addConsumer(
            QUEUE_LISTEN_DATA, handle_message(handle_logic),
            {
                noAck: true
            }
        )


        if(TURN_ON_SCHEDULE_FOR_CLOSED_TOURNAMENT == 'true'){
            cron_checking_tournament_closed()
        }


        // const pending_order = await stop_order_pending_in_tournament_expired_or_deleted("1aa8a2bb-4ad4-407b-8399-0d90657fa20e")

        // console.log({pending_order})
        
    } catch (error) {
        console.log(error)
    }
}


const handle_message = (fn) =>  msg => {
    const content = msg.content.toString()
    const data = JSON.parse(content)

    const routing_key = msg.fields.routingKey
    fn(routing_key, data)
}


start()