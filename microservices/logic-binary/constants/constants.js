module.exports = {
    REDIS_PORT: process.env.REDIS_PORT || 6380,
    REDIS_HOST: process.env.REDIS_HOST || '13.212.180.33',
    REDIS_PASSWORD: process.env.REDIS_PASSWORD || 'redis_password',
    PRICE_ASSET_OBJECT: 'price_list',
    MICROSERVICE_NAME: process.env.MICROSERVICE_NAME || 'LOGIC_BINARY',
    SENTRY_DNS: process.env.SENTRY_DNS || "https://42eaa2cfa2514b2bb426fb1304ad21b5@o971182.ingest.sentry.io/5923220",


    // set online or offline 
    HANDLE_LOGIC_SERVICE:  'online',
    EXCHANGE_LOGIC_SERVICE:  'online-binary',

    // // set offline 
    // HANDLE_LOGIC_SERVICE:  'offline',
    // EXCHANGE_LOGIC_SERVICE: process.env.EXCHANGE_LOGIC_SERVICE|| 'offline-binary',

    CHUNK_USER_LIST: process.env.CHUNK_USER_LIST || 2,
    PICE_USER_LIST: process.env.PICE_USER_LIST || 2,
    CHUNK_SERCVICE_NAME: process.env.CHUNK_SERCVICE_NAME || 'chunk_online_binary_service_1',


    USING_CHUNK: 0,
    CHUNK_ORDER_BINARY_LIST: process.env.CHUNK_ORDER_BINARY_LIST || 4,
    CHUNK_PICE_ORDER_BINARY: process.env.CHUNK_PICE_ORDER_BINARY|| 4,

    // RABBITMQ
    RABBIT_URL: process.env.RABBIT_URL || 'amqp://admin:admin@13.212.180.33:5672',
    // RABBIT_URL: 'amqps://masteradmin:BScXZW3aA5eetYw7@b-d28e7181-743a-47d1-9fb0-31782e33c478.mq.ap-southeast-1.amazonaws.com:5671',


    // hasura
    HASURA_ADMIN_SECRET: process.env.HASURA_ADMIN_SECRET || 'admin',
    // HASURA_URL: process.env.HASURA_URL || 'http://localhost:8095/v1/graphql',
    HASURA_URL: process.env.HASURA_URL || 'http://13.212.180.33:8095/v1/graphql',

    // BINARY_TYPE
    TYPE_HIGHER: 1,
    TYPE_LOWER: 2,

    //NAME_SPACE
    NAME_SPACE_BINARY: '/binary',
    NAME_SPACE_DEMO_ACCOUNTS: '/demo-accounts',
    NAME_SPACE_FOREX: '/forex',
    NAME_SPACE_FOREX_ACTIVE: '/forex-active',
    NAME_SPACE_FOREX_PENDING: '/forex-pending',

    //POLY
    POLY_API_KEY: process.env.POLY_API_KEY || 'QSXBIyYRBBprYPSTk2x452b8Du_GSVVt',

    // Duplicate deploy
    PRICE_TYPE: process.env.PRICE_TYPE || 'forex'

}