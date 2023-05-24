const amqp = require('amqplib')
const {Sentry} = require('../core/sentry')
const {MICROSERVICE_NAME} = require('../../constants/constants')

const state = {
    /**
     * @type {amqp.connection}
     */
    connection: null,
    connected: true
}
const TAG = '[AMQP]'

/**
 * Init AMQP connection
 * @param {*} amqpUrl
 * @param {*} options
 */


const connect = (amqpUrl) => new Promise(async (resolve, reject) => {
    try{
        const conn = await amqp.connect(amqpUrl)
        state.connection = conn
        console.log(`${TAG} connected to ${amqpUrl}`)

        Sentry.captureMessage(`${MICROSERVICE_NAME}:${TAG} connected to ${amqpUrl.split('@')[1]}`)

        conn.on('close', (error) => {
            console.log(`${TAG} connection close ${error}`)
            Sentry.captureException(error)
            process.exit(0)
        })

        conn.on("error", function(error)
        {
            console.log(error);
            Sentry.captureException(error)
            process.exit(0)
        });
        return resolve(state.connection)
        
    }catch(error){
        console.log(`${TAG} unable to connect to ${amqpUrl}`)
        Sentry.captureException(error)
        process.exit(0)
    }
})

module.exports = {
    connect,
    connection: () => state.connection
}