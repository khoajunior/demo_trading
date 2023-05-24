const get_current_price = require('./get_current_price')

module.exports = (amount, asset, price_type = `forex`) => new Promise(async(resolve, reject) => {
    try {
        let result
        let base_currency = asset.toString().slice(0, 3)
        if (base_currency === `WTI`) {
            base_currency = `WTICO`
        }
        if (base_currency != 'USD') { //asset không có USD là tiền cơ bản
            let new_asset = `${base_currency}/USD`
            if (price_type == `crypto`) {
                new_asset = `${base_currency}-USD`
            }

            const convert_price = await get_current_price(new_asset, price_type)
            result = convert_price.ask * amount
        } else {
            result = amount
        }
        return resolve(result)
    } catch (err) {
        console.error(err)
        return reject(err)
    }
})