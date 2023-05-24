module.exports = {
    amqpDefinitions: {
        exchanges: [
            { name: 'online-binary', type: 'topic', options: { durable: true } },
            { name: 'offline-binary', type: 'topic', options: { durable: true } },
        ],
        queues: [{
            name: 'handle-online-data-q',
           options: {messageTtl: 5000, maxLength: 3000000},
            bindingRules: [{
                exchange: 'online-binary',
                bindingKeys: ['data.*.*'],
            }],
        },
        {
            name: 'handle-offline-data-q',
           options: {messageTtl: 5000, maxLength: 3000000},
            bindingRules: [{
                exchange: 'offline-binary',
                bindingKeys: ['data.*.*'],
            }],
        }],
    }
};