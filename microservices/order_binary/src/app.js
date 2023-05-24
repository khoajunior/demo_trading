const redis_server = require('./core/redis_db')
const rabbitConf = require('./core/rabbit_config')
const messageBroker = require('./core/message_broker')
const { amqpDefinitions } = require('../constants/default')
const redis_db = require('./core/redis_db')
const sentry = require('./core/sentry')

var express = require('express');
var app = express();
const bodyParser = require('body-parser')
app.use(bodyParser.json())

const { PORT, RABBIT_URL} = require('../constants/constants')
const binary = require('./router')

const start = async() => {
    sentry.init()

    redis_db.connect()
    await redis_server.connect()

    await rabbitConf.connect(RABBIT_URL)
    await messageBroker.init(
        rabbitConf.connection(),
        amqpDefinitions
    )

    //app
    app.use('/', binary.router)

    app.listen(PORT, () => {
        console.log(`App listen at: ${PORT}`)
    })
}

start()