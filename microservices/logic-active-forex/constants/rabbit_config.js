const amqp = require('amqplib')

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


const connect = (amqpUrl, {logger= console}) => new Promise((resolve, reject) => {
    try{
        const conn = await amqp.connect(amqpUrl)
        state.connection = conn
        logger.info(`${TAG} connected to ${amqpUrl}`)

        conn.on('close', () => {
            logger.console.warn(`${TAG} connection close`)
            process.exit(0)
        })

        conn.on("error", function(err)
        {
            console.error(err);
            process.exit(0)
        });
        return resolve(state.connection)
        
    }catch(error){
        console.log(`${TAG} unable to connect to ${amqpUrl}`)
        process.exit(0)
    }
})

module.exports = {
    connect,
    connection: () => state.connection
}