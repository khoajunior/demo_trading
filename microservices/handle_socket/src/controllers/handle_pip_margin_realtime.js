const get_pip_margin = require('../services/get_pip_margin')
const { EMIT_PIP_VALUE_AND_MARGIN, ASSET_LIST, CRYPTO_LIST, COMMODITY_LIST, STOCK_LIST } = require('../../constants/constants')

module.exports = async (socket, asset) => {
  try {
    var price_type = ''
    var pip_value_margin = 0

    if (STOCK_LIST.includes(asset)) {
      price_type = 'stock'
      pip_value_margin = await get_pip_margin(asset, price_type)
      socket.emit(EMIT_PIP_VALUE_AND_MARGIN, pip_value_margin)
    }
    if (ASSET_LIST.includes(asset)) {
      price_type = 'forex'
      pip_value_margin = await get_pip_margin(asset, price_type)
      socket.emit(EMIT_PIP_VALUE_AND_MARGIN, pip_value_margin)
    }
    if (CRYPTO_LIST.includes(asset)) {
      price_type = 'crypto'
      pip_value_margin = await get_pip_margin(asset, price_type)
      socket.emit(EMIT_PIP_VALUE_AND_MARGIN, pip_value_margin)
    }
    if (COMMODITY_LIST.includes(asset)) {
      price_type = 'commodity'
      pip_value_margin = await get_pip_margin(asset, price_type)
      socket.emit(EMIT_PIP_VALUE_AND_MARGIN, pip_value_margin)
    }



  } catch (error) {
    console.log(error)
    // socket.emit(EMIT_PIP_VALUE_AND_MARGIN, {
    //   message: error,
    //   status: 400,
    //   data: null
    // })
  }
}