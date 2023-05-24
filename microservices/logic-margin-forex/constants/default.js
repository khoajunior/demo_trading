module.exports = {
  amqpDefinitions: {
    exchanges: [
      { name: 'online-margin-forex', type: 'topic', options: { durable: true } },
      { name: 'offline-margin-forex', type: 'topic', options: { durable: true } },
    ],
    queues: [
      {
        name: 'handle-online-data-q',
       options: {messageTtl: 5000, maxLength: 3000000},
        bindingRules: [
          {
            exchange: 'online-margin-forex',
            bindingKeys: ['data.*.*'],
          },
        ],
      },
      {
        name: 'handle-offline-data-q',
       options: {messageTtl: 5000, maxLength: 3000000},
        bindingRules: [
          {
            exchange: 'offline-margin-forex',
            bindingKeys: ['data.*.*'],
          },
        ],
      },
    ],
  }
};
