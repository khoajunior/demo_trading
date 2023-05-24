const redis_server = require('./core/redis_db')
const rabbitConf = require('./core/rabbit_config')
const messageBroker = require('./core/message_broker')
const { amqpDefinitions } = require('../constants/default')
const sentry = require('./core/sentry')
const device = require('express-device')

var Fingerprint = require('express-fingerprint')

var express = require('express');
var app = express();
 
app.use(Fingerprint({
    parameters:[
        // Defaults
        Fingerprint.useragent,
        Fingerprint.acceptHeaders,
        Fingerprint.geoip,
 
        // Additional parameters
        function(next) {
            // ...do something...
            next(null,{
            'param1':'value1'
            })
        },
        function(next) {
            // ...do something...
            next(null,{
            'param2':'value2'
            })
        },
    ]
}))
 


const bodyParser = require('body-parser')
app.use(bodyParser.json())
app.use(device.capture())

const { PORT, RABBIT_URL } = require('../constants/constants')
const forex = require('./router')

const start = async() => {
    sentry.init()

    //connect redis
    // console.log(process.env.REDIS_HOST)
    await redis_server.connect()

    await rabbitConf.connect(RABBIT_URL)
    await messageBroker.init(
        rabbitConf.connection(),
        amqpDefinitions
    )

    //app
    app.use('/', forex.router)

    app.listen(PORT, () => {
        console.log(`App listen at: ${PORT}`)
    })

}

start()