const {
    ASSET_OBJECT,
    FINNHUB_RECONNECT_TIME,
    FINNHUB_API_KEY,
    TIME_CHECKING_DATA
} = require('../../constants/constants')
const WebSocket = require('ws')
const pro_redis = require('./pro_redis_db')
const dev_redis = require('./dev_redis_db')
const { Sentry } = require('../core/sentry')


const connect = () => {
    try {
        // // all 
        send_data_to_socket_client(ASSET_OBJECT)


        // //stock
        // send_data_to_socket_client(STOCK_GROUP, 'stock')


        //crypto 
        // send_data_to_socket_client(COMMODITIES_OBJECT, CRYPTO_GROUP, 'crypto')


    } catch (error) {
        console.log(error)
    }
}



const send_data_to_socket_client = (asset_object) => {
    const socket = new WebSocket(`wss://ws.finnhub.io?token=${FINNHUB_API_KEY}`);
    var updated_data_time = new Date().getTime()



    // Connection opened -> Subscribe
    socket.addEventListener('open', function(event) {
        const asset_list = Object.keys(asset_object)
        for (var i = 0; i < asset_list.length; i++) {
            const asset = asset_list[i]
            socket.send(JSON.stringify({ 'type': 'subscribe', 'symbol': asset }))
        }
    })

    // Listen for messages
    socket.addEventListener('message', async(event) => {
        const data_list = JSON.parse(event.data).data

        // console.log({ data_list })
        if (!data_list || data_list.length == 0) {
            return
        }

        updated_data_time = new Date().getTime()

        for (var i = 0; i < data_list.length; i++) {
            // console.log({name: data_list[i]})
            const { s: symbol, p: price, t: time } = data_list[i]
            const item = asset_object[symbol]
            const {
                name: asset, price_group, type, spread, exchange, 
                buy_swap, sell_swap, standard_volume, scale_percent, base_pip} = item
            const dis = spread / 2
            const ask = price + dis
            const bid = price - dis


            const format_data = {
                ask,
                bid,
                mid: price,
                ts: time,
                price,
                time,
                asset,
                type,
                priority: 1,
                exchange,
                buy_swap,
                sell_swap,
                standard_volume,
                scale_percent,
                base_pip
            };
            // console.log({ format_data })

            await pro_redis.redis_db.hmsetAsync(price_group, asset, JSON.stringify(format_data))
            await dev_redis.redis_db.hmsetAsync(price_group, asset, JSON.stringify(format_data))

            //Thêm 4 cặp này vào loại forex
            if (asset === `XAU/USD` || asset === `XAG/USD` || asset === `BCO/USD` || asset === `WTICO/USD`) {
                const new_price_group = `forex_group`

                const add_more_forex = {
                    ...format_data,
                    type: 'forex',
                    price_group: new_price_group
                };
                // if (asset === `WTICO/USD`) {
                //     console.log(`------${add_more_forex.asset}-------`)
                //     console.log(add_more_forex.mid)
                // }
                await pro_redis.redis_db.hmsetAsync(new_price_group, asset, JSON.stringify(add_more_forex))
                await dev_redis.redis_db.hmsetAsync(new_price_group, asset, JSON.stringify(add_more_forex))
            }


        }

        // console.log('Message from server ',);
    })


    setInterval(() => {
        var current_time = new Date().getTime()
        var incoming_data_time = current_time - updated_data_time

        if (incoming_data_time > TIME_CHECKING_DATA) {
            const error_data = new Error(`Not realtime data from Finnhub to server`)
            Sentry.captureException(error_data)
        }
    }, TIME_CHECKING_DATA)


    socket.addEventListener('error', (error) => {
        console.log({ error })
        setTimeout(() => {
            send_data_to_socket_client(asset_object)
        }, FINNHUB_RECONNECT_TIME)
    })

    socket.addEventListener('close', reason => {
        console.log(reason)
        setTimeout(() => {
            send_data_to_socket_client(asset_object)
        }, FINNHUB_RECONNECT_TIME)
    })

}





module.exports = {
    connect
}