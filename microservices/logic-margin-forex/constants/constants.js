

module.exports = {
    REDIS_PORT: process.env.REDIS_PORT || 6380,
    REDIS_HOST: process.env.REDIS_HOST || '13.212.180.33',
    REDIS_PASSWORD: process.env.REDIS_PASSWORD || 'redis_password',
    MICROSERVICE_NAME: process.env.MICROSERVICE_NAME || 'LOGIC_MARGIN_FOREX',
    SENTRY_DNS: process.env.SENTRY_DNS || "https://42eaa2cfa2514b2bb426fb1304ad21b5@o971182.ingest.sentry.io/5923220",
    REALTIME_DEMO_ACCOUNT: 'realtime_demo_account',

    // SCALE UP DOCKER-COMPOSE FOR HANDLE LOGIC
    CHUNK_TIME_SCHEDULE_LIST: process.env.CHUNK_TIME_SCHEDULE_LIST || 1,
    CHUNK_PICE_TIME_SCHEDULE: process.env.CHUNK_PICE_TIME_SCHEDULE || 1,


    // set online or offline 
    HANDLE_LOGIC_SERVICE: 'online',
    EXCHANGE_LOGIC_SERVICE: 'online-margin-forex',

    // set online or offline 
    // HANDLE_LOGIC_SERVICE:  'offline',
    // EXCHANGE_LOGIC_SERVICE:  'offline-margin-forex',

    CHUNK_USER_LIST: process.env.CHUNK_USER_LIST || 1,
    PICE_USER_LIST: process.env.PICE_USER_LIST || 1,
    CHUNK_SERCVICE_NAME: process.env.CHUNK_SERCVICE_NAME || 'chunk_online_margin_forex_service_1',

    // RABBITMQ
    RABBIT_URL: process.env.RABBIT_URL || 'amqp://admin:admin@13.212.180.33:5672',

    // hasura
    HASURA_ADMIN_SECRET: process.env.HASURA_ADMIN_SECRET || 'admin',
    // HASURA_URL: process.env.HASURA_URL || 'http://localhost:8095/v1/graphql',
    HASURA_URL: process.env.HASURA_URL || 'http://13.212.180.33:8095/v1/graphql',

    TEST_ASSET: 'EURUSD',
    TEST_LEVERAGE: 500,
    TEST_QUANTITY: 1, //so lot
    LIMIT: 20, //Hạn mức cháy tài khoản
    BUY_LIMIT: 1,
    BUY_STOP: 2,
    SELL_LIMIT: 3,
    SELL_STOP: 4,

    // forex status
    STATUS_PENDING: 2,
    STATUS_ACTIVE: 3,
    STATUS_CLOSE: 4,
    STATUS_CANCEL: 5,

    //type 
    TYPE_BUY: 1,
    TYPE_SELL: 2,

    //NAME_SPACE
    NAME_SPACE_BINARY: '/binary',
    NAME_SPACE_DEMO_ACCOUNTS: '/demo-accounts',
    NAME_SPACE_FOREX: '/forex',
    NAME_SPACE_FOREX_ACTIVE: '/forex-active',
    NAME_SPACE_FOREX_PENDING: '/forex-pending',

    PRICE_ASSET_OBJECT: 'price_list',


    // 'stock_handle_margin_level'
    // 'crypto_handle_margin_level'
    HANDLE_MARGIN_LEVEL: 'handle_margin_level',
    PRICE_TYPE: process.env.PRICE_TYPE || 'forex',

    // database
    POSTGRES_URL: process.env.HASURA_GRAPHQL_DATABASE_URL || 'postgres://user:password@13.212.180.33:5555/testdev',

    //POLY
    POLY_API_KEY: process.env.POLY_API_KEY || 'QSXBIyYRBBprYPSTk2x452b8Du_GSVVt',


}