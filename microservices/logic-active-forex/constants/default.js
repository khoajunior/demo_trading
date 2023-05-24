module.exports = {
    env: 'development',
    port: 13231,
    host: 'localhost',
    rabbitUrl: 'amqp://localhost',
    amqpDefinitions: {
        exchanges: [
            //handler data
            { name: 'online-active-forex', type: 'topic', options: { durable: true } },
            { name: 'offline-active-forex', type: 'topic', options: { durable: true } },
        ],
        queues: [{
            name: 'handle-online-data-q',
           options: {messageTtl: 5000, maxLength: 3000000},
            bindingRules: [{
                exchange: 'online-active-forex',
                bindingKeys: ['data.*.*'],
            }],
        },
        {
            name: 'handle-offline-data-q',
           options: {messageTtl: 5000, maxLength: 3000000},
            bindingRules: [{
                exchange: 'offline-active-forex',
                bindingKeys: ['data.*.*'],
            }],
        },
     ],

    }
};