const cron = require('node-cron')
const get_transaction = require('../services/get_transaction')
const { TYPE_HIGHER, TYPE_LOWER, PRICE_TYPE, EXCHANGE_LOGIC_SERVICE, USING_CHUNK } = require('../../constants/constants')
const message_broker = require('../core/message_broker')
const chunk_user_list = require('../helpers/chunk_user_list')
const get_all_current_price = require('../helpers/get_all_current_price')
const chunk_order_list = require('../helpers/chunk_order_list')
const count_order = require('../services/count_order')


module.exports = () => new Promise((resolve, reject) => {
    console.log(`function close binary`)
    try {

        const pubChannel = message_broker.getPublishChannel()
        var order_list = []
        cron.schedule('45 * * * * *', async () => {
        // cron.schedule('*/3 * * * * *', async () => {
            try {
                // handle user_online
                // var user_list = null

                // if(HANDLE_LOGIC_SERVICE == 'online'){
                //     user_list = await chunk_user_list(NAME_SPACE_BINARY)
                // }

                const format_time = new Date(new Date(new Date().setSeconds(0)).setMilliseconds(0))
                const minutes = format_time.getMinutes()
                const current_time = new Date(format_time.setMinutes(minutes + 1)).toISOString()


                const price_object = await get_all_current_price(PRICE_TYPE)
                if (!price_object) {
                    return true
                }

                const item = {
                    is_checked: false,
                    end_time: current_time,
                    asset_list: Object.keys(price_object)
                }

                const order_length = await count_order(item)
                if (order_length > USING_CHUNK) {
                    const { limit, offset } = chunk_order_list(order_length)
                    item.limit = limit
                    item.offset = offset
                }

                // console.log({item})
                order_list = await get_transaction(item)

            } catch (error) {
                console.log(error)
            }


        })

        // cron per minute
        cron.schedule(' 0-59 * * * *', async() => {
        // cron.schedule('0-59 * * * * *', async () => {
            try {
                if (!order_list) {
                    return true
                }
                const price_object = await get_all_current_price(PRICE_TYPE)

                const closing_order_list = []
                for (var i = 0; i < order_list.length; i++) {
                    const order = order_list[i]

                    const { asset, open_price, type, investment, user_id, id, assetByAsset, tournament_id } = order
                    const { scale_percent } = assetByAsset
                    const price = JSON.parse(price_object[asset])

                    const compare_price = price.mid > open_price
                    const is_profit = (compare_price && type == TYPE_HIGHER) || (!compare_price && type == TYPE_LOWER)

                    var percent_profit_loss
                    var total_profit_loss
                    var equity

                    if (is_profit) {

                        percent_profit_loss = scale_percent
                        total_profit_loss = investment * scale_percent / 100
                        equity = total_profit_loss + investment

                    } else {
                        equity = 0
                        total_profit_loss = -investment
                        percent_profit_loss = -100
                    }

                    // update transaction
                    const new_order = {
                        close_price: price.mid,
                        updated_at: new Date().toISOString(),
                        total_profit_loss,
                        percent_profit_loss,
                        is_checked: true,
                        equity, // update for balance increment
                        id
                    }

                    closing_order_list.push(new_order)
                }

                pubChannel.publish(
                    EXCHANGE_LOGIC_SERVICE,
                    'data.close.binary',
                    Buffer.from(JSON.stringify(closing_order_list))
                )

            } catch (error) {
                console.log(error)
            }
        })
        return resolve(true)
    } catch (error) {
        console.log(error)
        return resolve(false)
    }
})
