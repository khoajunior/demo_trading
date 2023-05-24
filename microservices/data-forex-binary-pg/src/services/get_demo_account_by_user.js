const { TYPE_BUY, STATUS_ACTIVE } = require('../../constants/constants')
const { get_all_order } = require('./support_handler')
const get_all_current_price = require('../helpers/get_all_current_price')

//Input: user_id,tournament_id
module.exports = (input) => new Promise(async(resolve, reject) => {
    try {
        const { user_id, tournament_id, type } = input
        const price_detail = await get_all_current_price(type)

        const user_account = await get_all_order({
            user_list: [user_id],
            tournament_list: [tournament_id],
            status_list: [STATUS_ACTIVE]
        })
        const { balance } = user_account.account
        const { forex_list } = user_account

        const item = {
            user_id,
            tournament_id,
            type,
            balance,
            sum_profit_loss: 0,
            sum_margin: 0,
            margin_level: null,
            equity: 0,
            available: 0
        }

        forex_list.forEach(forex => {

            const { type, asset, open_price, id, fn_net_profit_loss, margin } = forex
            // console.log({forex, price_detail, price: price_detail[asset]})

            const price = JSON.parse(price_detail[asset])
                // console.log({price, price.ask, })

            if (!price) {
                console.log(`not found price for asset with forex id: ${id}`)
                return reject(`not found price for asset with forex id: ${id}`)
            }

            var close_price = price.ask
            if (type == TYPE_BUY) {
                close_price = price.bid
            }

            const net_profit_loss = fn_net_profit_loss * (close_price - open_price) || 0

            item.sum_profit_loss += net_profit_loss
            item.sum_margin += margin
        })

        item.equity = item.balance + item.sum_profit_loss
        item.available = item.equity - item.sum_margin

        if (item.sum_margin > 0) {
            item.margin_level = item.equity / item.sum_margin * 100
        }


        return resolve(item)


    } catch (error) {
        console.log(error)
        return reject(error)
    }
})