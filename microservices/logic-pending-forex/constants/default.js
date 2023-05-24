module.exports = {
    amqpDefinitions: {
      exchanges: [
        //handler data
        { name: 'online-pending-forex', type: 'topic', options: { durable: true } },
        { name: 'offline-pending-forex', type: 'topic', options: { durable: true } },
      ],
      queues: [
        {
          name: 'handle-online-data-q',
         options: {messageTtl: 5000, maxLength: 3000000},
          bindingRules: [
            {
              exchange: 'online-pending-forex',
              bindingKeys: ['data.*.*'],
            },
          ],
        },
        {
          name: 'handle-offline-data-q',
         options: {messageTtl: 5000, maxLength: 3000000},
          bindingRules: [
            {
              exchange: 'offline-pending-forex',
              bindingKeys: ['data.*.*'],
            },
          ],
        },
      ],
    }
  };
  