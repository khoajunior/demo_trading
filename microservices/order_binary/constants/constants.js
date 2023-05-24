module.exports = {
    HOST: process.env.HOST || 'localhost',
    PORT: process.env.PORT || 8080,

    PRICE_ASSET_OBJECT: 'price_list',
    ONLINE_USER_LIST: 'online_user_list38',
    EXCHANGE_LOGIC_SERVICE: 'order_binary',
    CACHE_SOCKET_COUNTER: 'cache_socket_counter',
    MICROSERVICE_NAME: process.env.MICROSERVICE_NAME || 'ORDER_BINARY',
    SENTRY_DNS: process.env.SENTRY_DNS || "https://42eaa2cfa2514b2bb426fb1304ad21b5@o971182.ingest.sentry.io/5923220",


    // SOCKET
    SOCKET_PORT: process.env.SOCKET_PORT || 5005,
    SOCKET_URL: process.env.SOCKET_URL || 'http://localhost:5005',

    JWT_PRIVATE_KEY: process.env.JWT_PRIVATE_KEY || "secretkey",
    JWT_ALGORITHM: 'RS256',
    JWT_EXP: 60 * 60 * 24 * 30, //30 days

    // REDIS
    REDIS_PORT: process.env.REDIS_PORT || 6380,
    //REDIS_HOST: process.env.REDIS_HOST || 'localhost',
    REDIS_HOST: process.env.REDIS_HOST || '13.212.180.33',
    REDIS_PASSWORD: process.env.REDIS_PASSWORD || 'redis_password',


    // KEYCLOAK
    // USER_INFO_API_URL: process.env.USER_INFO_API_URL || 'http://localhost:8097/auth/realms/master/protocol/openid-connect/userinfo',
    USER_INFO_API_URL: process.env.USER_INFO_API_URL || 'http://13.212.180.33:8097/auth/realms/master/protocol/openid-connect/userinfo',

    TEST_ASSET: 'EURUSD',

    // BINARY_TYPE
    TYPE_HIGHER: 1,
    TYPE_LOWER: 2,

    //NAME_SPACE
    NAME_SPACE_BINARY: '/binary',
    NAME_SPACE_DEMO_ACCOUNTS: '/demo-accounts',
    NAME_SPACE_FOREX: '/forex',
    NAME_SPACE_FOREX_ACTIVE: '/forex-active',
    NAME_SPACE_FOREX_PENDING: '/forex-pending',
    NAME_SPACE_PRICE_DETAIL: '/price-detail',

    // forex status
    STATUS_PENDING: 2,
    STATUS_ACTIVE: 3,
    STATUS_CLOSE: 4,
    STATUS_CANCEL: 5,

    // HASURA
    HASURA_ADMIN_SECRET: process.env.HASURA_ADMIN_SECRET || 'admin',
    // HASURA_URL: process.env.HASURA_URL || 'http://localhost:8095/v1/graphql',
    HASURA_URL: process.env.HASURA_URL || 'http://13.212.180.33:8095/v1/graphql',

    // RABBITMQ
    // RABBIT_URL: process.env.RABBIT_URL || 'amqp://admin:admin@localhost:5672',
    RABBIT_URL: process.env.RABBIT_URL || 'amqp://admin:admin@13.212.180.33:5672',

    //POLY
    POLY_API_KEY: process.env.POLY_API_KEY || 'QSXBIyYRBBprYPSTk2x452b8Du_GSVVt',

    // get_counter
    // example 1phut = 60s /2 = 30s
    COUNTER_KEY_FOR_CHECK_TIME: {
        1: { name: 'counter_one_minute', exp_time: 30 },
        3: { name: 'counter_three_minutes', exp_time: 90 },
        5: { name: 'counter_five_minutes', exp_time: 150 },
        10: { name: 'counter_ten_minutes', exp_time: 300 }
    },

    // TOURNAMENT_STATUS
    TOURNAMENT_ACTIVE_STATUS: 1,
    TOURNAMENT_DELETE_STATUS: 2,

    BINARY_ACTIVE_STATUS: 1,
    BINARY_CANCEL_STATUS: 2,

    OPTION_BINARY_TRADE: 1,
    OPTION_FOREX_TRADE: 2,

    PRICE_OBJECT: {
        1: 'forex',
        2: "stock",
        3: "commodity",
        4: 'crypto'
    },

    MINIMUM_AMOUNT_ASSET: {
        'EUR/USD': 0.001,
        'NZD/USD': 0.001,
        'GBP/USD': 0.001,
        'AUD/USD': 0.001,
        'USD/JPY': 0.001,
        'USD/CHF': 0.001,
        'USD/CAD': 0.001,
        'ETH-USD': 0.001,
        'BTC-USD': 0.001,
        'XRP-USD': 1,
        'BCH-USD': 0.1,
        'LTC-USD': 0.1,
        'XAU/USD': 0.001,
        'XAG/USD': 0.001
    }
}