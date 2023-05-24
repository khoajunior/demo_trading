const check_market_status = require('../helpers/check_market_status')

module.exports = async (req, res) => {
  try{
    const {product_type} = req.body.input

    const is_open = await check_market_status(product_type)

    return res.json({status: 200, message: 'handler success', data: is_open})
    
  }catch(error){
    return res.status(400).json({
      code: `handle_fail`,
      message: `${error}`
    })
  }
}