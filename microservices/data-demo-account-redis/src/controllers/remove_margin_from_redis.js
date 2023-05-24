const {remove_order} = require('../services/handler_margin')

module.exports = (margin_item) => new Promise(async (resolve, reject) => {
  try{
    await remove_order(margin_item)
    return resolve(true)

  }catch(error){
    console.log(error)
    return resolve(false)
  }
})