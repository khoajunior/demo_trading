module.exports = {
    HOST: process.env.HOST || 'localhost',
    PORT: 8080,

    // hasura
    HASURA_ADMIN_SECRET: process.env.HASURA_ADMIN_SECRET || 'admin',
    HASURA_URL: process.env.HASURA_URL || 'http://13.212.180.33:8095/v1/graphql',

    // RABBITMQ
    RABBIT_URL: process.env.RABBIT_URL || 'amqp://admin:admin@13.212.180.33:5672',
    // RABBIT_URL: 'amqps://masteradmin:BScXZW3aA5eetYw7@b-d28e7181-743a-47d1-9fb0-31782e33c478.mq.ap-southeast-1.amazonaws.com:5671',

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

    //TOURNAMENT_OPTION_TRADE
    OPTION_BINARY_TRADE: 1,
    OPTION_FOREX_TRADE: 2,

    // database
    POSTGRES_URL: process.env.HASURA_GRAPHQL_DATABASE_URL || 'postgres://user:password@13.212.180.33:5555/testdev',

}