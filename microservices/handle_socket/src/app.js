const socket_server = require('./core/socket')
const redis_server = require('./core/redis_db')
const socker_router = require('./socket_router')
const remove_all_socket_redis = require('./helpers/remove_all_socket_redis')
const rabbitConf = require('./core/rabbit_config')
const messageBroker = require('./core/message_broker')
const {RABBIT_URL, HANDLE_SOCKET_CLIENT_QUEUE} = require('../constants/constants')
const { amqpDefinitions } = require('../constants/default')
const {remove_all_socket_asset} = require('./helpers/socket_asset')
const sentry = require('./core/sentry')



const start = async () => {
    sentry.init()
    console.log({HANDLE_SOCKET_CLIENT_QUEUE})
    //connect redis
    // console.log(process.env.REDIS_HOST)


    redis_server.connect()

    socket_server.connect()


    await rabbitConf.connect(RABBIT_URL)

    await messageBroker.init(
        rabbitConf.connection(),
        amqpDefinitions
    )

    //remove all old socket in redis
    await remove_all_socket_redis() //TODO: làm xong nhớ bật cái này lên
    await remove_all_socket_asset()
    
    socker_router()


}

start()