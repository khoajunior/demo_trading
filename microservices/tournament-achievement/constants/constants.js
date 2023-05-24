// keycloak
const KEYCLOAK_USERNAME = process.env.KEYCLOAK_USERNAME || 'minhchau';
const KEYCLOAK_PASSWORD = process.env.KEYCLOAK_PASSWORD || 'minhchau2271994';
const KEYCLOAK_URL = process.env.KEYCLOAK_URL || 'http://13.212.180.33:8097'; //đổi link host
const KEYCLOAK_REALM = process.env.KEYCLOAK_REALM || 'master';
const KEYCLOAK_CLIENT = process.env.KEYCLOAK_CLIENT || 'hasura-keycloak-connector';

//http://localhost:8087/auth/admin/realms/master/users
const USER_API_URL = `${KEYCLOAK_URL}/auth/admin/realms/${KEYCLOAK_REALM}/users`;
const GET_TOKEN_API_URL = `${KEYCLOAK_URL}/auth/realms/${KEYCLOAK_REALM}/protocol/openid-connect/token`;
const USER_INFO_API_URL = `${KEYCLOAK_URL}/auth/realms/${KEYCLOAK_REALM}/protocol/openid-connect/userinfo`;
const REALM_URL = `${KEYCLOAK_URL}/auth/admin/realms/${KEYCLOAK_REALM}`;
//const NODE_ENV = process.env.NODE_ENV || 'local';

module.exports = {
    // PORT: 8080,
    PORT: process.env.PORT || 8080,
    HOST: process.env.HOST || `0.0.0.0`,

    REDIS_PORT: process.env.REDIS_PORT || 6380,
    REDIS_HOST: process.env.REDIS_HOST || '13.212.180.33',
    REDIS_PASSWORD: process.env.REDIS_PASSWORD || 'redis_password',
    MICROSERVICE_NAME: process.env.MICROSERVICE_NAME || 'TOURNAMENT_ACHIEVEMENT',
    SENTRY_DNS: process.env.SENTRY_DNS || "https://42eaa2cfa2514b2bb426fb1304ad21b5@o971182.ingest.sentry.io/5923220",

    // for scale up in docker-compose
    TURN_ON_SCHEDULE: process.env.TURN_ON_SCHEDULE || 'true',
    
    EXCHANGE_LOGIC_SERVICE: 'tournament-achievement-logic',

    //POLY
    POLY_API_KEY: process.env.POLY_API_KEY || 'QSXBIyYRBBprYPSTk2x452b8Du_GSVVt',

    // RABBITMQ
    RABBIT_URL: process.env.RABBIT_URL || 'amqp://admin:admin@13.212.180.33:5672',

    // hasura
    HASURA_ADMIN_SECRET: process.env.HASURA_ADMIN_SECRET || 'admin', //adminsecretforex,
    HASURA_URL: process.env.HASURA_URL || 'http://13.212.180.33:8095/v1/graphql',


    TEST_ASSET: 'EUR/USD',
    TEST_LEVERAGE: 500,
    TEST_QUANTITY: 1, //so lot
    LIMIT: 50, //Hạn mức cháy tài khoản
    BUY_LIMIT: 1,
    BUY_STOP: 2,
    SELL_LIMIT: 3,
    SELL_STOP: 4,


    // forex
    // status
    STATUS_PENDING: 2,
    STATUS_ACTIVE: 3,
    STATUS_CLOSE: 4,
    STATUS_CANCEL: 5,

    //type 
    TYPE_BUY: 1,
    TYPE_SELL: 2,

    // keycloak
    KEYCLOAK_USERNAME,
    KEYCLOAK_PASSWORD,
    KEYCLOAK_URL,
    KEYCLOAK_REALM,
    KEYCLOAK_CLIENT,
    USER_API_URL,
    GET_TOKEN_API_URL,
    USER_INFO_API_URL,
    REALM_URL,

    // Demo account
    DEFAULT_BALANCE: 10000,
    DEFAULT_BINARY_TOURNAMENT_ID: process.env.DEFAULT_BINARY_TOURNAMENT_ID || `f7607b79-549a-4de2-86a9-41f8b518e094`,
    DEFAULT_FOREX_TOURNAMENT_ID: process.env.DEFAULT_FOREX_TOURNAMENT_ID || '36839503-ae08-4062-b78f-c283d0aa9b3d',

    PRICE_ASSET_OBJECT: 'price_list',

    //ROLE
    ROLE_HASURA_ADMIN: 'admin',
    ROLE_ADMIN: `super_admin`,
    ROLE_MANAGER: 'manager',
    ROLE_USER: `user`,

    //aws
    ACCESS_KEY_ID: process.env.ACCESS_KEY_ID || `AKIAYTXSWUB6GBT6YHUM`,
    SECRET_ACCESS_KEY: process.env.SECRET_ACCESS_KEY || `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`,
    BUCKET_NAME: process.env.BUCKET_NAME || `merritrade`,
    S3_REGION: process.env.S3_REGION || 'ap-southeast-1',


    // TOURNAMENT_STATUS
    TOURNAMENT_ACTIVE_STATUS: 1,
    TOURNAMENT_DELETE_STATUS: 2,
    TOURNAMENT_HIDDEN_STATUS: 3,


    //TOURNAMENT_OPTION_TRADE
    OPTION_BINARY_TRADE: 1,
    OPTION_FOREX_TRADE: 2,

    PRICE_OBJECT: {
        1: 'forex',
        2: "stock",
        3: "commodity",
        4: 'crypto'
    },

    DEFAULT_LEVERAGE_CRYPTO: 3,
    DEFAULT_LEVERAGE_STOCK: 20,
    DEFAULT_LEVERAGE: 200,
    DEFAULT_LEVERAGE_COMMODITY: 50,

    //TYPE_SORT
    TYPE_SORT_BALANCE: 1,
    TYPE_SORT_EQUITY: 2,

    //Tên loại hình giao dịch
    TYPE_TRADE_NAME: {
        1: `BINARY`,
        2: `CFD`
    },

    //Tên sản phẩm giao dịch
    PRODUCT_TRADE_NAME: {
        1: `Forex`,
        2: `Stock`,
        3: `Commodity`,
        4: `Crypto`
    },

    // CACHE
    REALTIME_DEMO_ACCOUNT: 'realtime_demo_account',
    USER_PROFILE: 'user_profile',
}