const state = {
    connection: null,
    pubChannel: null,
    subChannel: null
}

/**
 * asset exchanges with provided exchange rules
 * @param {*} channel
 * @param {*} exchanges
 */
const assertExchanges = (channel, exchanges) => {
    const result = exchanges.map(({ name, type, options }) =>
        channel.assertExchange(name, type, options)
    )
    return Promise.all(result)
}


/**
 * assert queues with provided queue rules
 * @param {*} channel
 * @param {*} queues
 */
const assertQueues = (channel, queues) => {
    const results = queues.map(queue => {
        channel.assertQueue(queue.name, queue.options)
    })

    return Promise.all(results)
}

/**
 * bind queue to exchange with provided rules
 * @param {*} channel
 * @param {*} bindingRules
 */
const bindQueues = (channel, queues) => new Promise((resolve, reject) => {
    try {
        console.log({ queues })
        const result = queues.map(queue =>
            queue.bindingRules.map(rule =>
                rule.bindingKeys.map(key => {
                    console.log({ name: queue.name, exchange: rule.exchange, key })
                    return channel.bindQueue(queue.name, rule.exchange, key)
                    }
                )
            )
        )
        return resolve(result)

    } catch (error) {
        return reject(error)
    }
})

/**
 * add consumer for specific queue
 * @param {*} channel
 * @param {*} queueName
 * @param {*} fn  
 * @param {*} options
 */
const addConsumer = (queueName, fn, options) =>
    new Promise((resolve, reject) => {
        state.subChannel.consume(queueName, fn, options)
        return resolve()
    })

const init = (connection, { exchanges, queues }) =>
    new Promise(async (resolve, reject) => {
        try {
            state.pubChannel = await connection.createChannel()
            state.subChannel = await connection.createChannel()
            await assertExchanges(state.pubChannel, exchanges)
            await assertQueues(state.pubChannel, queues)
            await bindQueues(state.pubChannel, queues)
            return resolve()
        } catch (error) {
            console.log("------------------------", error)
            return reject(error)
        }
    })

module.exports = {
    init,
    addConsumer,
    getPublishChannel: () => state.pubChannel
}
