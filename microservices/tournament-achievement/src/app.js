const express = require('express')
const app = express()
const bodyParser = require('body-parser')
app.use(bodyParser.json())
const fileUpload = require('express-fileupload')
app.use(bodyParser.urlencoded({ extended: true }))
const { PORT, RABBIT_URL, MICROSERVICE_NAME, TURN_ON_SCHEDULE } = require('../constants/constants')
const rabbitConf = require('./core/rabbit_config')
const messageBroker = require('./core/message_broker')
const { amqpDefinitions } = require('../constants/default')
const { cron_finish_tournament } = require('../src/services/tournament')
const { sort_user_by_performance } = require('./services/sort_rank_user')
const cron = require('node-cron')
const sentry = require('./core/sentry')
const redis_server = require('./core/redis_db')

const start = async () => {
    sentry.init()

    await redis_server.connect()

    await rabbitConf.connect(RABBIT_URL)

    await messageBroker.init(
        rabbitConf.connection(),
        amqpDefinitions
    )

    app.use(fileUpload({
        limits: {
            fileSize: 10 * 1024 * 1024
        }
    }));

    const achievements = require('./router')
    app.use('/', achievements.router)

    if (TURN_ON_SCHEDULE == 'true') {
        // cron per day
        cron.schedule('*/5 * * * *', async () => { //Cứ 3 tiêng chạy 1 lần
            // cron.schedule('* */1 * * * *', async() => {
            try {
                sentry.Sentry.captureMessage(`${MICROSERVICE_NAME}:CRON_PER_DAY_SORTING_RANK_IN_TOURNAMENT`)
                cron_finish_tournament()
            } catch (err) {
                console.error(err)
                sentry.Sentry.captureException(err)
            }
        })

        //cron at day 1 of every month for get rank user by performance
        cron.schedule('0 0 0 1 * *', async () => { //00:00:00 ngày 1 hàng tháng
            try {
                sentry.Sentry.captureMessage(`${MICROSERVICE_NAME}:CRON_SORTING_USER_PERFORMANT_BY_MONTH`)
                sort_user_by_performance()
            } catch (err) {
                console.error(err)
                sentry.Sentry.captureException(err)
            }
        })
    }


    app.listen(PORT, () => {
        console.log(`service listen on: ${PORT}`)
    })
}

start()