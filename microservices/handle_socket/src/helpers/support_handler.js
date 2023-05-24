const { OBJECT_PIP_VALUE } = require('../../constants/constants')
const convert_to_usd = require('./convert_to_usd')


const get_pip_value = (quantity, asset = 'EUR/USD', open_price, price_type = 'forex') => new Promise(async(resolve, reject) => {
    try {
        let asset_object = OBJECT_PIP_VALUE[asset]
        let result;
        //Trường hợp có định nghĩa asset trong constant
        if (asset_object) {
            result = quantity * asset_object.pip_value
            return resolve(result)
        }

        //Trường hợp forex
        let pip = 0.0001
        if (asset.includes('JPY')) {
            pip = 0.01
        }
        result = quantity * 100000 * pip / open_price

        result = await convert_to_usd(result, asset, price_type)
        return resolve(result)
    } catch (err) {
        return reject(err)
    }
});

//margin value
const get_margin = (quantity, leverage, asset = 'EUR/USD', price_type = 'forex') => new Promise(async(resolve, reject) => {
    try {
        const asset_object = OBJECT_PIP_VALUE[asset]
        var contract_amount = 100000
        if (asset_object) {
            contract_amount = asset_object.amount
        }

        let margin = quantity * contract_amount / leverage

        margin = await convert_to_usd(margin, asset, price_type)

        return resolve(margin)
    } catch (err) {
        return reject(err)
    }
});

module.exports = {
    get_pip_value,
    get_margin
}