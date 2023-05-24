module.exports = {
    amqpDefinitions: {
      exchanges: [
        { name: 'data-demo-account', type: 'topic', options: { durable: true } },
      ],
      queues: [
        {
          name: 'demo-account-q',
         options: {messageTtl: 5000, maxLength: 3000000},
          bindingRules: [
            {
              exchange: 'data-demo-account',
              bindingKeys: ['result.data.*'],
            },
          ],
        },
      ],
    }
  };
  