const axios = require("axios")
const { CAPTCHA_SECRET, CAPTCHA_URL } = require('../../constants/constants')

module.exports = (captcha) => new Promise(async (resolve, reject) => {
  try {

    const details = {
      response: captcha,
      secret: CAPTCHA_SECRET
    }

    let formBody = []

    for (const property in details) {
      const encodeKey = encodeURIComponent(property)
      const encodedValue = encodeURIComponent(details[property])
      formBody.push(encodeKey + '=' + encodedValue)
    }
    formBody = formBody.join('&')

    const {data} = await axios({
      method: 'POST',
      url: CAPTCHA_URL,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
      },
      data: formBody,
    })

    if(!data.success){
      return reject("captcha không tồn tại")
    }
    return resolve(true)
    
  } catch (error) {
    console.log(error)
    return reject("Captcha không hợp lệ")
  }
})