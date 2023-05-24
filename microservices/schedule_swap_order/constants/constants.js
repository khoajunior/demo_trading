module.exports = {
  SENTRY_DNS: process.env.SENTRY_DNS || "https://42eaa2cfa2514b2bb426fb1304ad21b5@o971182.ingest.sentry.io/5923220",
  MICROSERVICE_NAME: process.env.MICROSERVICE_NAME || 'CRON_SWAP',
  // hasura
  HASURA_ADMIN_SECRET: process.env.HASURA_ADMIN_SECRET || 'admin', //adminsecretforex,
  HASURA_URL: process.env.HASURA_URL || 'http://13.212.180.33:8095/v1/graphql',
  // HASURA_URL: 'http://localhost:8095/v1/graphql',

  // for scale up in docker-compose
  TURN_ON_SCHEDULE_HANDLING_SWAP: process.env.TURN_ON_SCHEDULE_HANDLING_SWAP || 'true',

  HANDLE_MARGIN_LEVEL: 'handle_margin_level',


  REDIS_PORT: process.env.REDIS_PORT || 6380,
  // REDIS_HOST: process.env.REDIS_HOST || 'localhost',
  // REDIS_HOST: process.env.REDIS_HOST || '13.250.49.9',
  REDIS_HOST: process.env.REDIS_HOST || '13.212.180.33',
  REDIS_PASSWORD: process.env.REDIS_PASSWORD || 'redis_password',

  FOREX_TYPE: 1,
  STOCK_TYPE: 2,
  COMMODITY_TYPE: 3,
  CRYPTO_TYPE: 4,

  // TOURNAMENT_STATUS
  TOURNAMENT_ACTIVE_STATUS: 1,
  TOURNAMENT_DELETE_STATUS: 2,


  // forex
  // status
  STATUS_PENDING: 2,
  STATUS_ACTIVE: 3,
  STATUS_CLOSE: 4,
  STATUS_CANCEL: 5,

  //type 
  TYPE_BUY: 1,
  TYPE_SELL: 2,

  SWAP_DAYS: 360,
  PRICE_OBJECT: {
    1: 'forex',
    2: "stock",
    3: "commodity",
    4: 'crypto'
},

}