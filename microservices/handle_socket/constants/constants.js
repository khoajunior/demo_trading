module.exports = {
    HOST: process.env.HOST || 'localhost',
    PORT: 8080,
    PRICE_TIME_INTERVAL: 1000, //EMIT DATA TO FRONTEND

    
    SOCKET_PORT: process.env.SOCKET_PORT || 5008,
    MICROSERVICE_NAME: process.env.MICROSERVICE_NAME || 'HANDLE_SOCKET',
    SENTRY_DNS: process.env.SENTRY_DNS || "https://42eaa2cfa2514b2bb426fb1304ad21b5@o971182.ingest.sentry.io/5923220",
   
    // for scale up (only one TURN_ON_SAVE-COUNTER_TIME_TO_REDIS is true. need name to PICE_SERVER_NAME)
    TURN_ON_SAVE_COUNTER_TIME_TO_REDIS: process.env.TURN_ON_SAVE_COUNTER_TIME_TO_REDIS || 'true',
    PICE_SERVER_NAME: process.env.PICE_SERVER_NAME || "PICE_SOCKET_NAME",

    HANDLE_SOCKET_CLIENT_QUEUE: process.env.PICE_SERVER_NAME ? `${process.env.PICE_SERVER_NAME}_Q`:  'PICE_SOCKET_NAME_Q',

    // CACHE
    PRICE_ASSET_OBJECT: 'price_list',
    ONLINE_USER_LIST: 'online_user_list13',
    HANDLE_ACTIVE_ORDER_FOREX: 'active_order_forex',
    HANDLE_PENDING_ORDER_FOREX: 'pending_order_forex',
    HANDLE_ORDER_BINARY: 'order_binary',
    CACHE_SOCKET_ASSET: 'cache_socket_asset',
    CACHE_SOCKET_COUNTER: 'cache_socket_counter',
    REALTIME_DEMO_ACCOUNT: 'realtime_demo_account',



    POLY_API_KEY: process.env.POLY_API_KEY || 'QSXBIyYRBBprYPSTk2x452b8Du_GSVVt',
    WS_POLY_URL: process.env.WS_POLY_URL || 'wss://socket.polygon.io',
    WS_POLY_SET_TIME: process.env.WS_POLY_SET_TIME || 500,


    JWT_PRIVATE_KEY: process.env.JWT_PRIVATE_KEY || "secretkey",
    JWT_ALGORITHM: 'RS256',
    JWT_EXP: 60 * 60 * 24 * 30, //30 days

    REDIS_PORT: process.env.REDIS_PORT || 6380,
    // // REDIS_HOST: process.env.REDIS_HOST || 'localhost',
    // // REDIS_HOST: process.env.REDIS_HOST || '13.250.49.9',
    REDIS_HOST: process.env.REDIS_HOST || '13.212.180.33',
    REDIS_PASSWORD: process.env.REDIS_PASSWORD || 'redis_password',


    // REDIS_PORT: process.env.REDIS_PORT || 6388,
    // // REDIS_HOST: process.env.REDIS_HOST || 'localhost',
    // // REDIS_HOST: process.env.REDIS_HOST || '13.250.49.9',
    // REDIS_HOST: process.env.REDIS_HOST || '127.0.0.1',


    USER_INFO_API_URL: process.env.USER_INFO_API_URL || 'http://13.212.180.33:8097/auth/realms/master/protocol/openid-connect/userinfo',


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

    // RABBITMQ
    RABBIT_URL: process.env.RABBIT_URL || 'amqp://admin:admin@13.212.180.33:5672',

    // server
    HASURA_ADMIN_SECRET: process.env.HASURA_ADMIN_SECRET || 'admin',
    HASURA_URL: process.env.HASURA_URL || 'http://13.212.180.33:8095/v1/graphql',


    // //NAME_SPACE
    NAME_SPACE_SOCKET: 'socket_demo_account',


    PRICE_SPREAD_PIPS: 3,

    //Rate for chart
    EMIT_CHART_REALTIME: 'chart-realtime',
    EMIT_GET_PRICE: 'get:price',
    EMIT_CURRENT_TIME: 'get:time',
    EMIT_PIP_VALUE_AND_MARGIN: 'get:pip:margin',
    EMIT_COUNTER: 'get:counter',
    EMIT_ALL_COUNTER_FOR_BINARY: 'get:all_counter',
    EMIT_DEMO_ACCOUNT: 'get:demo_account',

    EMIT_RELOAD_ORDER_ACTIVE: 'reload_order_active',
    EMIT_RELOAD_ORDER_PENDING: 'reload_order_pending',
    EMIT_RELOAD_ORDER_PENDING_CANCEL: 'reload_order_pending_cancel',

    NAME_SPACE_PRICE_DETAIL: '/price-detail',

    // time interval
    TIME_PIP_MARGIN_REALTIME: 10 * 60 * 1000, //10 minutes

    // Demo account
    DEFAULT_BALANCE: 10000,

    // SOCKET_URL: process.env.SOCKET_URL || 'http://13.212.180.33:5005',
    // SOCKET_URL: process.env.SOCKET_URL || 'http://localhost:5005',
    TIME_CHECKING_ONLINE: 15 * 1000, // 10s



    ASSET_LIST: [
        'EUR/USD', 'NZD/USD', 'GBP/USD', 'AUD/USD',
        'USD/JPY', 'USD/CHF', 'USD/CAD', 'XAG/USD', 'XAU/USD', 'WTICO/USD', 'BCO/USD'
    ],

    CRYPTO_LIST: [
        'BTC-USD', 'LTC-USD',
        'ETH-USD', 'BCH-USD', 'XRP-USD',
    ],

    COMMODITY_LIST: [
        'XAG/USD', 'XAU/USD', 'WTICO/USD', 'BCO/USD'
    ],

    STOCK_LIST: [
        'AAPL',
        // 'MSFT', 
        // 'GOOG', 'GOOGL', 'AMZN', 'FB', 'TSLA', 'BRK.A', 'BRK.B', 'NVDA',
        // 'TSM', 'V', 'JPM', 'BABA', 'WMT', 'UNH', 'BAC', 'ASML', 'MA', 'PG', 'HD', 'PYPL',
        // 'DIS', 'ADBE', 'CMCSA', 'NKE', 'PFE', 'CRM', 'LLY', 'NFXL', 'ORCL', 'CSCO', 'KO',
        // 'TM', 'XOM', 'DHR', 'NVO', 'VZ', 'ABT', 'TMO', 'INTC', 'PEP', 'ACN', 'ABBV', 'AVGO',
        // 'NVS', 'COST', 'WFC', 'T', 'MRK', 'SHOP', 'CVX', 'MS', 'AZN', 'MDT', 'SE', 'TXN',
        // 'MCD', 'SAP', 'TMUS', 'UPS', 'BHP', 'BBL', 'NEE', 'QCOM', 'LIN', 'PM',
        // 'HON', 'RDS.A', 'RDS.B', 'INTU', 'CHTR', 'MRNA', 'BX', 'BMY', 'RY', 'C', 'BLK',
        // 'UL', 'UNP', 'LOW', 'GS', 'SCHW', 'SBUX', 'AMD', 'AMT', 'PTR', 'AXP', 'SNY', 'RTX',
        // 'BA', 'AMGN', 'NOW', 'SONY', 'ISRG', 'SQ', 'IBM', 'EL', 'RIO'
    ],

    OBJECT_PIP_VALUE: {
        //Crypto
        "BTC-USD": { pip_value: 1, base_pip: 1, amount: 1 },
        "ETH-USD": { pip_value: 1, base_pip: 1, amount: 1 },
        "BCH-USD": { pip_value: 1, base_pip: 1, amount: 1 },
        "LTC-USD": { pip_value: 1, base_pip: 1, amount: 1 },
        "XRP-USD": { pip_value: 0.001, base_pip: 0.001, amount: 1 },

        //Commodity
        "XAU/USD": { pip_value: 10, base_pip: 0.1, amount: 100 },
        // "XAG/USD": { pip_value: 5, base_pip: 0.001, amount: 5000 }
        "XAG/USD": { pip_value: 50, base_pip: 0.01, amount: 5000 }, // pip in bac 
        "WTICO/USD": { pip_value: 10, base_pip: 0.01, amount: 1000 },
        "BCO/USD": { pip_value: 10, base_pip: 0.01, amount: 1000 },
    }
}