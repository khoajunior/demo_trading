module.exports = {
    amqpDefinitions: {
      exchanges: [
        { name: 'data-forex-binary', type: 'topic', options: { durable: true } },
        { name: 'subcription-update-order-ex', type: 'topic', options: { durable: true } },
      ],
      queues: [
        {
          name: 'handle-pending-active-margin-redis-q',
          options: {messageTtl: 5000, maxLength: 3000000},
          bindingRules: [
            {
              exchange: 'data-forex-binary',
              bindingKeys: ['data.*.*'],
            },
          ],
        },
        // handle socket dev
        {
          name: 'PICE_SOCKET_NAME_Q',
          options: {messageTtl: 5000, maxLength: 3000000},
          bindingRules: [
            {
              exchange: 'subcription-update-order-ex',
              bindingKeys: ['data.*.*'],
            },
          ],
        },
        // PRICE_SOCKET_NAME => SCALE UP HANDLE SOCKET production
        {
          name: 'PICE_SOCKET_NAME_1_Q',
          options: {messageTtl: 5000, maxLength: 3000000},
          bindingRules: [
            {
              exchange: 'subcription-update-order-ex',
              bindingKeys: ['data.*.*'],
            },
          ],
        },
        {
          name: 'PICE_SOCKET_NAME_2_Q',
          options: {messageTtl: 5000, maxLength: 3000000},
          bindingRules: [
            {
              exchange: 'subcription-update-order-ex',
              bindingKeys: ['data.*.*'],
            },
          ],
        },
        {
          name: 'PICE_SOCKET_NAME_3_Q',
          options: {messageTtl: 5000, maxLength: 3000000},
          bindingRules: [
            {
              exchange: 'subcription-update-order-ex',
              bindingKeys: ['data.*.*'],
            },
          ],
        },

         // PRICE_SOCKET_NAME => SCALE UP HANDLE SOCKET ONLY production
         {
          name: 'PICE_SOCKET_NAME_6_Q',
          options: {messageTtl: 5000, maxLength: 3000000},
          bindingRules: [
            {
              exchange: 'subcription-update-order-ex',
              bindingKeys: ['data.*.*'],
            },
          ],
        },
        {
          name: 'PICE_SOCKET_NAME_4_Q',
          options: {messageTtl: 5000, maxLength: 3000000},
          bindingRules: [
            {
              exchange: 'subcription-update-order-ex',
              bindingKeys: ['data.*.*'],
            },
          ],
        },
        {
          name: 'PICE_SOCKET_NAME_5_Q',
          options: {messageTtl: 5000, maxLength: 3000000},
          bindingRules: [
            {
              exchange: 'subcription-update-order-ex',
              bindingKeys: ['data.*.*'],
            },
          ],
        },
      ],
    }
  };
  