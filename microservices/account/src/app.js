const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const fileUpload = require('express-fileupload')
const { PORT, RABBIT_URL, TURN_ON_VERIFY_TELEGRAM} = require('../constants/constants')
const messageBroker = require('./core/message_broker')
const { amqpDefinitions } = require('../constants/default')
const rabbitConf = require('./core/rabbit_config')
const account = require('./router')
const sentry = require('./core/sentry')
const redis_db = require('./core/redis_db')
const cron = require('node-cron')
const { handle_session_expire } = require('../src/services/handle_session_login')
const verify_by_telegram = require('./services/verify_by_telegram')

const start = async () => {

    if(TURN_ON_VERIFY_TELEGRAM == 'true'){
        verify_by_telegram()
    }

    sentry.init()
    await redis_db.connect()

    await rabbitConf.connect(RABBIT_URL)

    await messageBroker.init(
        rabbitConf.connection(),
        amqpDefinitions
    )
    app.use(bodyParser.json())
    app.use(bodyParser.urlencoded({ extended: true }))

    app.use(fileUpload({
        limits: {
            fileSize: 10 * 1024 * 1024
        }
    }));


    app.use('/', account.router)

    app.listen(PORT, () => {
        console.log(`service listen on: ${PORT}`)
    })

    cron.schedule('0 0 0 */10 * *', async () => { //Cứ 10 ngày chạy 1 lần
        try {
            handle_session_expire()
        } catch (err) {
            console.error(err)
        }
    })
}

start()
