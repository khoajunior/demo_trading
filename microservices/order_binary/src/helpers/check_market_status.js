const axios = require('axios')
const {POLY_API_KEY} = require('../../constants/constants')

module.exports = (price_type = 'forex') => new Promise(async (resolve, reject) => {
  try{

    if(price_type != 'forex'){
      return resolve(true)
    }
    var days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    var months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    
    // var day = days[ now.getDay() ];
    // var month = months[ now.getMonth() ];
    // https://www.xtb.com/vn/gia-dong-cua-la-gi-kb
    
    
    const date = new Date()
    const hours = date.getUTCHours()
    const day = days[date.getUTCDay()]
    
    const close_market = 21
    const open_market = 22
    const from_close = (hours >= close_market && day == 'Friday') || day == 'Saturday'
    const to_close = hours < open_market && day == 'Sunday' 
    
    
    if(from_close || to_close){
      return resolve(false)
    }
    
    return resolve(true)
    


  }catch(error){
    console.log(error)
    return reject(error)
  }

})


