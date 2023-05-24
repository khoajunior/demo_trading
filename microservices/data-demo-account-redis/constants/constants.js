module.exports = {
    REDIS_PORT: process.env.REDIS_PORT || 6380,
    REDIS_HOST: process.env.REDIS_HOST || '13.212.180.33',
    REDIS_PASSWORD: process.env.REDIS_PASSWORD || 'redis_password',
    MICROSERVICE_NAME: process.env.MICROSERVICE_NAME || 'DATA_DEMO_ACCOUNT_REDIS',
    SENTRY_DNS: process.env.SENTRY_DNS || "https://42eaa2cfa2514b2bb426fb1304ad21b5@o971182.ingest.sentry.io/5923220",
    
    //redis cache
    REALTIME_DEMO_ACCOUNT: 'realtime_demo_account',
    USER_PROFILE: 'user_profile',
    
    // set online or offline 
    QUEUE_LISTEN_DATA: process.env.QUEUE_LISTEN_DATA || 'handle-pending-active-margin-redis-q',

    // for scale up in docker-compose
    TURN_ON_SCHEDULE_FOR_CLOSED_TOURNAMENT: process.env.TURN_ON_SCHEDULE_FOR_CLOSED_TOURNAMENT || 'true',

    // // set online or offline 
    // HANDLE_LOGIC_SERVICE:  'offline',
    // QUEUE_LISTEN_DATA: process.env.QUEUE_LISTEN_DATA || 'handle-offline-data-q',


    // SAVE DATA TO REDIS WITH KEY
    FOREX_TP_SELL_ACTIVE_KEY: '_FX_TP_SELL_ACTIVE_KEY',
    FOREX_SL_SELL_ACTIVE_KEY: '_FX_SL_SELL_ACTIVE_KEY',
    FOREX_TP_BUY_ACTIVE_KEY: '_FX_TP_BUY_ACTIVE_KEY',
    FOREX_SL_BUY_ACTIVE_KEY: '_FX_SL_BUY_ACTIVE_KEY',

    // PENDING
    FOREX_BUY_LIMIT_PENDING_KEY: '_FX_BUY_LIMIT_PENDING_KEY',
    FOREX_BUY_STOP_PENDING_KEY: '_FX_BUY_STOP_PENDING_KEY',
    FOREX_SELL_LIMIT_PENDING_KEY: '_FX_SELL_LIMIT_PENDING_KEY',
    FOREX_SELL_STOP_PENDING_KEY: '_FX_SELL_STOP_PENDING_KEY',

    REDIS_CREATE_ORDER: 'NX',
    REDIS_UPDATE_ORDER: 'XX',

    // hasura
    HASURA_ADMIN_SECRET: process.env.HASURA_ADMIN_SECRET || 'admin',
    HASURA_URL: process.env.HASURA_URL || 'http://13.212.180.33:8095/v1/graphql',

    // RABBITMQ
    RABBIT_URL: process.env.RABBIT_URL || 'amqp://admin:admin@13.212.180.33:5672',
    // RABBIT_URL: process.env.RABBIT_URL || 'amqp://admin:admin@54.179.160.37:5673',

    TEST_ASSET: 'EURUSD',
    TEST_LEVERAGE: 500,
    TEST_QUANTITY: 1, //so lot
    LIMIT: 50, //Hạn mức cháy tài khoản
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

    // CACHE
    PRICE_ASSET_OBJECT: 'price_list',
    ONLINE_USER_LIST: 'online_user_list13',
    HANDLE_ACTIVE_ORDER_FOREX: 'active_order_forex',
    HANDLE_PENDING_ORDER_FOREX: 'pending_order_forex',
    HANDLE_ORDER_BINARY: 'order_binary',
    HANDLE_MARGIN_LEVEL: 'handle_margin_level',

    TIME_TO_CHECKING_TOURNAMENT_EXP: process.env.TIME_TO_CHECKING_TOURNAMENT_EXP || '0 0 8 * * *', // 5day

    // database
    POSTGRES_URL: process.env.HASURA_GRAPHQL_DATABASE_URL || 'postgres://user:password@13.212.180.33:5555/testdev',

    // TOURNAMENT_STATUS
    TOURNAMENT_ACTIVE_STATUS: 1,
    TOURNAMENT_DELETE_STATUS: 2,

    PRICE_OBJECT: {
        1: 'forex',
        2: "stock",
        3: "commodity",
        4: 'crypto'
    },

    FOREX_TYPE: 1,
    STOCK_TYPE: 2,
    COMMODITY_TYPE: 3,
    CRYPTO_TYPE: 4,

    // cron
    CRON_ALL_SYSTEM: 'CRON_ALL_SYSTEM',
    CHECK_TOURNAMENT_CLOSE_OR_DELETE: 'CHECK_TOURNAMENT_CLOSE_OR_DELETE',
    SORT_RANK_TOURNAMENT_CLOSE: 'SORT_RANK_TOURNAMENT_CLOSE',
    HANDLE_PROCCESSING: 'proccessing',
    HANDLE_DONE: 'done',

    OPTION_BINARY_TRADE: 1,
    OPTION_FOREX_TRADE: 2,



}