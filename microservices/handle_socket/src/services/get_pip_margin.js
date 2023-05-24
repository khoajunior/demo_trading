const {get_pip_value, get_margin} = require('../helpers/support_handler')
const get_current_price = require('../helpers/get_current_price')

module.exports = (asset, price_type = 'forex') => new Promise(async (resolve, reject) => {
  try {

    const quantity = 1
    const leverage = 1
    const current_price = await get_current_price(asset, price_type)
    const pip_value = await get_pip_value(quantity, asset, current_price.ask, price_type)

    const margin = await get_margin(quantity, leverage, asset, price_type )

    const result = {
      pip_value,
      margin
    }

    return resolve(result)

  } catch (error) {
    console.log(error)
    return reject(error)
  }
})