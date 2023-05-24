module.exports = {
    HOST: process.env.HOST || 'localhost',
    PORT: 8080,

    SOCKET_PORT: process.env.SOCKET_PORT || 5005,
    EXCHANGE_LOGIC_SERVICE: 'order_forex',
    MICROSERVICE_NAME: process.env.MICROSERVICE_NAME || 'ORDER_FOREX',
    SENTRY_DNS: process.env.SENTRY_DNS || "https://42eaa2cfa2514b2bb426fb1304ad21b5@o971182.ingest.sentry.io/5923220",

    EXCHANGE_HANDLE_ORDER_SOCKET_CLIENT: 'order_forex_socket_client_ex',
    
    // CACHE
    PRICE_ASSET_OBJECT: 'price_list',
    ONLINE_USER_LIST: 'online_user_list13',
    HANDLE_ACTIVE_ORDER_FOREX: 'active_order_forex',
    HANDLE_PENDING_ORDER_FOREX: 'pending_order_forex',
    HANDLE_ORDER_BINARY: 'order_binary',


    JWT_PRIVATE_KEY: process.env.JWT_PRIVATE_KEY || "secretkey",
    JWT_ALGORITHM: 'RS256',
    JWT_EXP: 60 * 60 * 24 * 30, //30 days

    REDIS_PORT: process.env.REDIS_PORT || 6380,
    // REDIS_HOST: process.env.REDIS_HOST || 'localhost',
    // REDIS_HOST: process.env.REDIS_HOST || '13.250.49.9',
    REDIS_HOST: process.env.REDIS_HOST || '13.212.180.33',
    REDIS_PASSWORD: process.env.REDIS_PASSWORD || 'redis_password',


    MAXIMAL_VOLUME: process.env.MAXIMAL_VOLUME || 100,
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


    //NAME_SPACE
    NAME_SPACE_BINARY: '/binary',
    NAME_SPACE_DEMO_ACCOUNTS: '/demo-accounts',
    NAME_SPACE_FOREX: '/forex',
    NAME_SPACE_FOREX_ACTIVE: '/forex-active',
    NAME_SPACE_FOREX_PENDING: '/forex-pending',
    NAME_SPACE_SOCKET: '/socket',

    PRICE_SPREAD_PIPS: 3,

    //
    TIME_CHECK_ONLINE: 120, //2 minustes
    MIN_TIME_CLOSE_ORDER: 60 * 1000, // 1 MINUTE => milliseconds

    //POLY
    POLY_API_KEY: process.env.POLY_API_KEY || 'QSXBIyYRBBprYPSTk2x452b8Du_GSVVt',


    // SAVE DATA TO REDIS WITH KEY
    FOREX_TP_SELL_ACTIVE_KEY: '_FX_TP_SELL_ACTIVE_KEY',
    FOREX_SL_SELL_ACTIVE_KEY: '_FX_SL_SELL_ACTIVE_KEY',
    FOREX_TP_BUY_ACTIVE_KEY: '_FX_TP_BUY_ACTIVE_KEY',
    FOREX_SL_BUY_ACTIVE_KEY: '_FX_SL_BUY_ACTIVE_KEY',

    // PENDING
    FOREX_BUY_LIMIT_PENDING_KEY: 'FX_BUY_LIMIT_PENDING_KEY',
    FOREX_BUY_STOP_PENDING_KEY: 'FX_BUY_STOP_PENDING_KEY',
    FOREX_SELL_LIMIT_PENDING_KEY: 'FX_SELL_LIMIT_PENDING_KEY',
    FOREX_SELL_STOP_PENDING_KEY: 'FX_SELL_STOP_PENDING_KEY',

    // TOURNAMENT_STATUS
    TOURNAMENT_ACTIVE_STATUS: 1,
    TOURNAMENT_DELETE_STATUS: 2,

    OPTION_BINARY_TRADE: 1,
    OPTION_FOREX_TRADE: 2,

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
        'AAPL', 'MSFT', 'GOOG', 'GOOGL', 'AMZN', 'FB', 'TSLA', 'BRK.A', 'BRK.B', 'NVDA',
        // 'TSM', 'V', 'JPM', 'BABA', 'WMT', 'UNH', 'BAC', 'ASML', 'MA', 'PG', 'HD', 'PYPL',
        // 'DIS', 'ADBE', 'CMCSA', 'NKE', 'PFE', 'CRM', 'LLY', 'NFXL', 'ORCL', 'CSCO', 'KO',
        // 'TM', 'XOM', 'DHR', 'NVO', 'VZ', 'ABT', 'TMO', 'INTC', 'PEP', 'ACN', 'ABBV', 'AVGO',
        // 'NVS', 'COST', 'WFC', 'T', 'MRK', 'SHOP', 'CVX', 'MS', 'AZN', 'MDT', 'SE', 'TXN',
        // 'MCD', 'SAP', 'TMUS', 'UPS', 'BHP', 'BBL', 'NEE', 'QCOM', 'LIN', 'PM',
        // 'HON', 'RDS.A', 'RDS.B', 'INTU', 'CHTR', 'MRNA', 'BX', 'BMY', 'RY', 'C', 'BLK',
        // 'UL', 'UNP', 'LOW', 'GS', 'SCHW', 'SBUX', 'AMD', 'AMT', 'PTR', 'AXP', 'SNY', 'RTX',
        // 'BA', 'AMGN', 'NOW', 'SONY', 'ISRG', 'SQ', 'IBM', 'EL', 'RIO'
    ],
    PRICE_OBJECT: {
        1: 'forex',
        2: "stock",
        3: "commodity",
        4: 'crypto'
    },

    FOREX_TYPE: 1,
    CRYPTO_TYPE: 4,
    STOCK_TYPE: 2,

    DEFAULT_LEVERAGE_CRYPTO: 3,
    DEFAULT_LEVERAGE_STOCK: 20,

    MINIMUM_AMOUNT_ASSET: {
        'EUR/USD': 0.01,
        'NZD/USD': 0.01,
        'GBP/USD': 0.01,
        'AUD/USD': 0.01,
        'USD/JPY': 0.01,
        'USD/CHF': 0.01,
        'USD/CAD': 0.01,
        'ETH-USD': 0.1,
        'BTC-USD': 0.01,
        'XRP-USD': 1,
        'BCH-USD': 0.1,
        'LTC-USD': 0.1,
        'XAU/USD': 0.001,
        'XAG/USD': 0.001
    },

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
    },

    //redis
    REALTIME_DEMO_ACCOUNT: 'realtime_demo_account',
}


//************Note**********************/
// 1 lot = 100 ounce vàng
// 1 lot = 5000 ounce bạc
// Giao dịch 1 lot vàng = 100 ounces, thì 1 pip XAU/USD = 100*0.1 = 10$ 
// Giao dịch 0.1 lot vàng = 10 ounces, thì 1 pip XAU/USD = 10*0.1 = 1$
// Giao dịch 0.01 lot vàng = 1 ounce, thì 1 pip XAU/USD = 1*0.1 = 0.1$

// https://kienthucforex.com/cach-tinh-lot-vang/
// Theo cách tính ở trên thì 0.1$ là giá trị của 1 pip trên 1 cặp XAU/USD hay nói chính xác hơn là trên 1 đơn vị vàng hay 1 ounce vàng. 
// Còn trên thực tế, khi nói đến giá trị của pip thì người ta sẽ đề cập đến giá trị của pip khi giao dịch 1 lot tiêu chuẩn.