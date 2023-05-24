module.exports = {
    amqpDefinitions: {
        exchanges: [
            { name: 'handle-socket', type: 'topic', options: { durable: true } },
        ],
        queues: [{
            name: 'handle-price-q',
            options: {messageTtl: 5000, maxLength: 3000000},
            bindingRules: [{
                exchange: 'handle-socket',
                bindingKeys: ['data.*.*'],
            }],
        }]

    }
};