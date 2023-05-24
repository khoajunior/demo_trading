const rabbitConf = require('./core/rabbit_config')
const messageBroker = require('./core/message_broker')
const { RABBIT_URL, QUEUE_LISTEN_DATA } = require('../constants/constants')
const { amqpDefinitions } = require('../constants/default')
const socket_emit = require('./core/ws_emit')
const handle_logic = require('./handler_logic')
const postgres = require('./core/postgres')
const trade_forex_pg = require('./services/trade_forex_pg')
const trade_binary_pg = require('./services/trade_binary_pg')
const sentry = require('./core/sentry')
const redis_db = require('./core/redis_db')

const start = async () => {
    try {
        redis_db.connect()
        sentry.init()
        socket_emit.start()
        await postgres.connect()

        await rabbitConf.connect(RABBIT_URL)

        await messageBroker.init(
            rabbitConf.connection(),
            amqpDefinitions
        )


        messageBroker.addConsumer(
            QUEUE_LISTEN_DATA,
            handle_message(handle_logic), { noAck: true }
        )


        // test stop 
        // const item = {
        //     end_time: new Date().toISOString(),
        //     count_id_list: [
        //         5, 6, 7, 8, 9
        //     ],
        //     close_price: 120
        // }

        // const new_item = {
        //     count_id_list: [34],
        //     close_price: 1.17863,
        //     end_time: '2021-07-19T07:48:17.918Z'
        // }
        // await trade_forex_pg.stop_order(new_item)

        //test pending

        // const item = {
        //     start_time: new Date().toISOString(),
        //     count_id_list: [
        //         1879, 1880
                      
        //     ],
        //     open_price: 115.471,
        //     price_type: 'forex'
        // }
        // await trade_forex_pg.update_pending_to_active(item)


        //test slop_order_pending_list
        // const item = {
        //     user_id: '30239d5b-65d1-4aaf-acaa-59352cba869d',
        //     tournament_id: '6ec9e4ab-a188-4946-85b0-38649a832db8'
        // }

        // await trade_forex_pg.stop_order_pending_list(item)


        // test stop order binary
        // const item = {
        //     close_price: 123.545454,
        //     updated_at: new Date().toISOString(),
        //     total_profit_loss: 400,
        //     is_checked: true,
        //     equity: 300,
        //     id: 'b1a34447-1a57-414c-8ac7-7d02a5fd9ccb'
        // }

        // const new_item = {
        //     close_price: 12.3958,
        //     updated_at: '2021-07-19T06:18:48.222Z',
        //     total_profit_loss: 178,
        //     percent_profit_loss: 89,
        //     is_checked: true,
        //     equity: 378,
        //     id: 'be5d4c95-0a67-42ea-98f5-e6e455b794a7'
        //   }

        // await trade_binary_pg.stop_order(new_item)
    } catch (error) {
        console.log(error)
    }
}

const handle_message = (fn) => msg => {
    const content = msg.content.toString()
    // console.log({ content })
    const data = JSON.parse(content)
    // console.log({ message: data })

    const routing_key = msg.fields.routingKey
    fn(routing_key, data)
}

start()