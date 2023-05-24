module.exports = {
  amqpDefinitions: {
    exchanges: [
      { name: 'order_binary', type: 'topic', options: { durable: true } },
    ],
    queues: [
      {
        name: 'handle-pending-active-margin-redis-q',
       options: {messageTtl: 5000, maxLength: 3000000},
        bindingRules: [
          {
            exchange: 'order_binary',
            bindingKeys: ['data.*.*'],
          },
        ],
      },
    ],
  }
};
