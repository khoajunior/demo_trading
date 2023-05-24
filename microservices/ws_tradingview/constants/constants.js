module.exports = {

    PORT: process.env.PORT || 8083,
    HOST: process.env.HOST || "0.0.0.0",

    PRO_REDIS_URL: process.env.PRO_REDIS_URL || 'redis://127.0.0.1:6387',
    DEV_REDIS_URL: process.env.DEV_REDIS_URL || `redis://13.212.180.33:6380`,
    SERVER_RECONECTION_INTERVAL: 1000 * 40,
    MICROSERVICE_NAME: process.env.MICROSERVICE_NAME || 'WS_FOREX_POLIGON_PRICE',
    SENTRY_DNS: process.env.SENTRY_DNS || "https://42eaa2cfa2514b2bb426fb1304ad21b5@o971182.ingest.sentry.io/5923220",

    // HASURA 
    HASURA_ADMIN_SECRET: process.env.HASURA_ADMIN_SECRET || 'admin',
    // HASURA_URL: process.env.HASURA_URL || 'http://localhost:8095/v1/graphql',
    HASURA_URL: process.env.HASURA_URL || 'http://13.212.180.33:8095/v1/graphql',


    // cache
    PRICE_ASSET_OBJECT: 'price_list',

    REDIS_PORT: process.env.REDIS_PORT || 6380,
    REDIS_HOST: process.env.REDIS_HOST || '13.212.180.33',
    REDIS_PASSWORD: process.env.REDIS_PASSWORD || 'redis_password',

    COMPARE_TAKE_PROFIT_STOP_LOSS_MINIUM: 0.0000000000000001,
    MINIMUM_PRICE_STOCK: 0,
    MAXIMUM_PRICE_STOCK: 1000000000000,
    RABBIT_URL: process.env.RABBIT_URL || 'amqp://admin:admin@13.212.180.33:5672',


    // deploy wsCWqIvHicYKKrH2GrrA
    // tradermade
    TRADERMADE_STREAMING_KEY: process.env.TRADERMADE_STREAMING_API_KEY || 'wsi52x1VlDixoqx9uARw',
    TRADERMADE_WS_URL: process.env.TRADERMADE_WS_URL || 'wss://marketdata.tradermade.com/feedadv',
    TRADERMADE_RECONECTION_INTERVAL: 1000 * 40,
    TRADERMADE_CURRENCY_LIST: ['EUR/USD'],
    FINNHUB_API_KEY: process.env.FINNHUB_API_KEY || "c52sl2qad3ifcc9lvebg",
    FINNHUB_RECONNECT_TIME: 5000,
    TIME_CHECKING_DATA: 1000 * 5 * 60, // 5 PHUT



    ASSET_OBJECT: {
        'OANDA:EUR_USD': {
            spread: 0.0001,
            name: 'EUR/USD',
            price_group: 'forex_group',
            type: 'forex',
            exchange: 'OANDA',
            scale_percent: 90,
            buy_swap: -5.4,
            sell_swap: 0.35,
            standard_volume: 100000,
            base_pip: 0.0001
        },
        'OANDA:NZD_USD': {
            spread: 0.00012,
            name: 'NZD/USD',
            price_group: 'forex_group',
            type: 'forex',
            exchange: 'OANDA',
            scale_percent: 82,
            buy_swap: -1.85,
            sell_swap: -2.25,
            standard_volume: 100000,
            base_pip: 0.0001

        },
        'OANDA:GBP_USD': {
            spread: 0.00012,
            name: 'GBP/USD',
            price_group: 'forex_group',
            type: 'forex',
            exchange: 'OANDA',
            scale_percent: 85,
            buy_swap: -4.1,
            sell_swap: -3.6,
            standard_volume: 100000,
            base_pip: 0.0001
        },
        'OANDA:AUD_USD': {
            spread: 0.00015,
            name: 'AUD/USD',
            price_group: 'forex_group',
            type: 'forex',
            exchange: 'OANDA',
            scale_percent: 87,
            buy_swap: -2.8,
            sell_swap: -1.9,
            standard_volume: 100000,
            base_pip: 0.0001
        },
        'OANDA:USD_JPY': {
            spread: 0.008,
            name: 'USD/JPY',
            price_group: 'forex_group',
            type: 'forex',
            exchange: 'OANDA',
            scale_percent: 85,
            buy_swap: -2.3,
            sell_swap: -3.75,
            standard_volume: 100000,
            base_pip: 0.01
        },
        'OANDA:USD_CHF': {
            spread: 0.00015,
            name: 'USD/CHF',
            price_group: 'forex_group',
            type: 'forex',
            exchange: 'OANDA',
            scale_percent: 83,
            buy_swap: 0.3,
            sell_swap: -6.2,
            standard_volume: 100000,
            base_pip: 0.0001

        },
        'OANDA:USD_CAD': {
            spread: 0.00022,
            name: 'USD/CAD',
            price_group: 'forex_group',
            type: 'forex',
            exchange: 'OANDA',
            scale_percent: 90,
            buy_swap: -3.45,
            sell_swap: -3.3,
            standard_volume: 100000,
            base_pip: 0.0001
        },

        // crypto
        'COINBASE:BTC-USD': {
            spread: 40.09,
            name: 'BTC-USD',
            price_group: 'crypto_group',
            type: 'crypto',
            exchange: 'COINBASE',
            scale_percent: 89,
            buy_swap: -90,
            sell_swap: -30,
            standard_volume: 1,
            base_pip: 1
        },
        'COINBASE:ETH-USD': {
            spread: 5.53,
            name: 'ETH-USD',
            price_group: 'crypto_group',
            type: 'crypto',
            exchange: 'COINBASE',
            scale_percent: 88,
            buy_swap: -100,
            sell_swap: -100,
            standard_volume: 1,
            base_pip: 1
        },
        'COINBASE:LTC-USD': {
            spread: 1.47,
            name: 'LTC-USD',
            price_group: 'crypto_group',
            type: 'crypto',
            exchange: 'COINBASE',
            scale_percent: 86,
            buy_swap: -25,
            sell_swap: -25,
            standard_volume: 1,
            base_pip: 1
        },
        'COINBASE:BCH-USD': {
            spread: 1.51,
            name: 'BCH-USD',
            price_group: 'crypto_group',
            type: 'crypto',
            exchange: 'COINBASE',
            scale_percent: 85,
            buy_swap: -50,
            sell_swap: -50,
            standard_volume: 1,
            base_pip: 1
        },
        'BITFINEX:XRPUSD': {
            spread: 0.00286,
            name: 'XRP-USD',
            price_group: 'crypto_group',
            type: 'crypto',
            exchange: 'BITFINEX',
            scale_percent: 82,
            buy_swap: -5.4,
            sell_swap: -5.6,
            standard_volume: 1,
            base_pip: 0.001
        },

        // commodities
        'OANDA:XAG_USD': {
            spread: 0.054,
            name: 'XAG/USD',
            price_group: 'commodity_group',
            type: 'commodity',
            exchange: 'OANDA',
            scale_percent: 84,
            buy_swap: -1.71,
            sell_swap: 0.55,
            standard_volume: 5000,
            base_pip: 0.01
        },
        'OANDA:XAU_USD': {
            spread: 0.3,
            name: 'XAU/USD',
            price_group: 'commodity_group',
            type: 'commodity',
            exchange: 'OANDA',
            scale_percent: 87,
            buy_swap: -1.71,
            sell_swap: 0.55,
            standard_volume: 100,
            base_pip: 0.1
        },
        'OANDA:WTICO_USD': {
            spread: 0.3, //Nhớ sửa -> TODO
            name: 'WTICO/USD',
            price_group: 'commodity_group',
            type: 'commodity',
            exchange: 'OANDA',
            scale_percent: 90,
            buy_swap: -3.37,
            sell_swap: -1.5698,
            standard_volume: 1000,
            base_pip: 0.01
        },
        'OANDA:BCO_USD': {
            spread: 0.3, //Nhớ sửa -> TODO
            name: 'BCO/USD',
            price_group: 'commodity_group',
            type: 'commodity',
            exchange: 'OANDA',
            scale_percent: 89,
            buy_swap: -3.2653,
            sell_swap: -1.4498,
            standard_volume: 1000,
            base_pip: 0.01
        }

    },


    CREATE_OR_UPDATE_ASSET: {
        IS_NEW_UPDATING: true,
        ASSET_OBJECT: {
            // forex
            'EUR/USD': {
                name: 'EUR/USD',
                scale_percent: 90,
                buy_swap: -5.4,
                sell_swap: 0.35,
                standard_volume: 100000,
                base_pip: 0.0001
            },
            'NZD/USD': {
                name: 'NZD/USD',
                scale_percent: 82,
                buy_swap: -1.85,
                sell_swap: -2.25,
                standard_volume: 100000,
                base_pip: 0.0001
            },
            'GBP/USD': {
                name: 'GBP/USD',
                scale_percent: 85,
                buy_swap: -4.1,
                sell_swap: -3.6,
                standard_volume: 100000,
                base_pip: 0.0001
            },
            'AUD/USD': {
                name: 'AUD/USD',
                scale_percent: 87,
                buy_swap: -2.8,
                sell_swap: -1.9,
                standard_volume: 100000,
                base_pip: 0.0001
            },
            'USD/JPY': {
                name: 'USD/JPY',
                scale_percent: 85,
                buy_swap: -2.3,
                sell_swap: -3.75,
                standard_volume: 100000,
                base_pip: 0.01
            },
            'USD/CHF': {
                name: 'USD/CHF',
                scale_percent: 83,
                buy_swap: 0.3,
                sell_swap: -6.2,
                standard_volume: 100000,
                base_pip: 0.0001
            },
            'USD/CAD': {
                name: 'USD/CAD',
                scale_percent: 90,
                buy_swap: -3.45,
                sell_swap: -3.3,
                standard_volume: 100000,
                base_pip: 0.0001
            },

            //crypto
            'BTC-USD': {
                name: 'BTC-USD',
                scale_percent: 89,
                buy_swap: -90,
                sell_swap: -30,
                standard_volume: 1,
                base_pip: 1
            },
            'LTC-USD': {
                name: 'LTC-USD',
                scale_percent: 86,
                buy_swap: -25,
                sell_swap: -25,
                standard_volume: 1,
                base_pip: 1
            },
            'ETH-USD': {
                name: 'ETH-USD',
                scale_percent: 88,
                buy_swap: -100,
                sell_swap: -100,
                standard_volume: 1,
                base_pip: 1
            },
            'BCH-USD': {
                name: 'BCH-USD',
                scale_percent: 85,
                buy_swap: -50,
                sell_swap: -50,
                standard_volume: 1,
                base_pip: 1
            },
            'XRP-USD': {
                name: 'XRP-USD',
                scale_percent: 82,
                buy_swap: -5.4,
                sell_swap: -5.6,
                standard_volume: 1,
                base_pip: 0.001
            },

            // commodity
            'XAG/USD': {
                name: 'XAG/USD',
                scale_percent: 84,
                buy_swap: -1.71,
                sell_swap: 0.55,
                standard_volume: 5000,
                base_pip: 0.01
            },
            'XAU/USD': {
                name: 'XAU/USD',
                scale_percent: 87,
                buy_swap: -1.71,
                sell_swap: 0.55,
                standard_volume: 100,
                base_pip: 0.1
            },
            'WTICO/USD': {
                name: 'WTICO/USD',
                scale_percent: 90,
                buy_swap: -3.37,
                sell_swap: -1.5698,
                standard_volume: 1000,
                base_pip: 0.01
            },
            'BCO/USD': {
                name: 'BCO/USD',
                scale_percent: 89,
                buy_swap: -3.2653,
                sell_swap: -1.4498,
                standard_volume: 1000,
                base_pip: 0.01
            }
        },
    },




    STOCK_EXCHANGE: 'NASDAQ',
    CRYPTO_EXCHANGE: 'COINBASE',
    FOREX_EXCHANGE: 'FX_IDC',

    FOREX_DEMO_PRICE: 0.00003,

    // id_default_tourament
    POLY_API_KEY: process.env.POLY_API_KEY || 'QSXBIyYRBBprYPSTk2x452b8Du_GSVVt',
    WS_POLY_URL: process.env.WS_POLY_URL || 'wss://socket.polygon.io',
    WS_POLY_SET_TIME: process.env.WS_POLY_SET_TIME || 500,

    NUMBER_DAYS_REMOVE_PRICE: 2,

    SOCKET_PRICE_FOREX_PORT: process.env.SOCKET_PRICE_FOREX_PORT || 5008,
    SOCKET_PRICE_POLIGON_PASSWORD: process.env.SOCKET_PRICE_POLIGON_PASSWORD || 'admin',
    EMIT_POLIGON_PRICE: 'price_detail',
    FOREX_GROUP: 'forex_group',
    CRYPTO_GROUP: 'crypto_group',
    STOCK_GROUP: 'stock_group',


    PRIORITY_FOREX: {
        'EUR/USD': 1,
        'AUD/USD': 2,
        'USD/JPY': 3,
        'EUR/GBP': 4,
        'CHF/JPY': 5,
        'NZD/CHF': 6,
        'USD/NOK': 7,
        'NOK/JPY': 8,
        'EUR/ZAR': 9,
        'EUR/NZD': 10
    },

    PRIORITY_CRYPTO: {
        'ETH-USD': 1,
        'EOS-USD': 2,
        'TRX-USD': 3,
        'BCH-USD': 4,
        'LTC/USD': 5,
        'BTC-USD': 6,
        'XRP-USD': 7,
        'ZEC-USD': 8,
        'DASH-USD': 9,
        'ETC-USD': 10
    },

    PRIORITY_STOCK: {}


}