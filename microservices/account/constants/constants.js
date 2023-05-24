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
    PORT: process.env.PORT || 8080,
    HOST: process.env.HOST || `0.0.0.0`, //`localhost`,
    EXCHANGE_LOGIC_SERVICE: 'user_account',
    FRONT_END_URL: process.env.FRONT_END_URL || 'http://localhost:3000',

    MICROSERVICE_NAME: process.env.MICROSERVICE_NAME || 'ACCOUNT',
    SENTRY_DNS: process.env.SENTRY_DNS || "https://42eaa2cfa2514b2bb426fb1304ad21b5@o971182.ingest.sentry.io/5923220",
    REDIS_PORT: process.env.REDIS_PORT || 6380,
    REDIS_HOST: process.env.REDIS_HOST || '13.212.180.33', //13.212.180.33  localhost
    REDIS_PASSWORD: process.env.REDIS_PASSWORD || 'redis_password',
    TURN_ON_VERIFY_TELEGRAM: process.env.TURN_ON_VERIFY_TELEGRAM || false,
    TELEGRAM_TOKEN_BOT: process.env.TELEGRAM_TOKEN_BOT || '5051122239:AAE1U3ojmv902xX0L-WjcTH6NMuj9h4vapo',

    // redis
    REALTIME_DEMO_ACCOUNT: 'realtime_demo_account',
    USER_PROFILE: 'user_profile',

    // RABBITMQ
    RABBIT_URL: process.env.RABBIT_URL || 'amqp://admin:admin@13.212.180.33:5672',

    // hasura
    HASURA_ADMIN_SECRET: process.env.HASURA_ADMIN_SECRET || 'admin', //adminsecretforex,
    HASURA_URL: process.env.HASURA_URL || 'http://13.212.180.33:8095/v1/graphql',


    TEST_ASSET: 'EURUSD',
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

    //verify email
    TIME_EXPIRE: 10 * 60, //10 minutes
    SALT: process.env.SALT || 10,

    // twillio
    // TWILLIO_SECRET_KEY: `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`,
    // TWILLIO_EMAIL: 'noreply@fx-tournament.com', //'ngphong11998@gmail.com',

    TWILLIO_SECRET_KEY: `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`,
    TWILLIO_EMAIL: 'noreply@merritrade.com', //'ngphong11998@gmail.com',

    MAILGUN_API_KEY: process.env.MAILGUN_API_KEY || 'ff9de6b0803dd02422486beaa160ddee-2ac825a1-c970615a',
    MAILGUN_DOMAIN: process.env.MAILGUN_DOMAIN || 'merritrade.com',
    MAILGUN_EMAIL: process.env.MAILGUN_EMAIL || 'noreply@merritrade.com',

    //ticket
    DEFAULT_TICKET: 50,

    // TOURNAMENT_STATUS
    TOURNAMENT_ACTIVE_STATUS: 1,
    TOURNAMENT_DELETE_STATUS: 2,

    //TOURNAMENT_OPTION_TRADE
    OPTION_BINARY_TRADE: 1,
    OPTION_FOREX_TRADE: 2,


    PRICE_OBJECT: {
        1: 'forex',
        2: "stock",
        3: "commodity",
        4: 'crypto'
    },

    //TYPE_SIGNED_URL
    LINK_FRONT_CMND: 1,
    LINK_BACK_CMND: 2,
    LINK_AVATAR: 3,
    LINK_COVER_IMAGE_TOURNAMENT: 4,
    LINK_PDF_CONDITION: 5,
    LINK_BRAND_LOGO: 6,
    LINK_FRONT_PASSPORT: 7,
    LINK_BACK_PASSPORT: 8,

    //Error keycloak
    EMAIL_EXISTED: `User exists with same email`,
    USERNAME_EXISTED: `User exists with same username`,
    USER_EXIST:`User exists with same username or email`,
    HANDLE_NANTIONAL_CARD_URL: process.env.HANDLE_NANTIONAL_CARD_URL || 'http://13.212.180.33:8088/national_id', 
    // HANDLE_NANTIONAL_CARD_URL: process.env.HANDLE_NANTIONAL_CARD_URL || 'http://localhost:5000/national_id',
    
    AUTHEN_KEY_OTP: process.env.AUTHEN_KEY_OTP || 'dGlzYW5taWNhcGk6SDU5YWJiSQ==',

    CAPTCHA_URL: process.env.CAPTCHA_URL || "https://hcaptcha.com/siteverify",
    CAPTCHA_SECRET: process.env.CAPTCHA_SECRET || "0xFDcEB1AdDb69325e80A506A714728aDb6f9c8Ff2",
    LIMIT_USER_IN_BRAND: 3,

    SIZE_AVAILABLE_PASSPORT: 4
}
