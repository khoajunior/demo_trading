module.exports = {
    env: 'development',
    port: 13231,
    host: 'localhost',
    rabbitUrl: 'amqp://localhost',
    amqpDefinitions: {
        exchanges: [
            //handler data
            { name: 'tournament-achievement-logic', type: 'topic', options: { durable: true } },
        ],
        queues: [{
            name: 'handle-pending-active-margin-redis-q',
           options: {messageTtl: 5000, maxLength: 3000000},
            bindingRules: [{
                exchange: 'tournament-achievement-logic',
                bindingKeys: ['data.*.*'],
            }],
        }],
    }
};