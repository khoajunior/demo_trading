const axios = require('axios')
const { POLY_API_KEY } = require('../../constants/constants')

module.exports = (from_currency, amount, to_currency = `USD`) => new Promise(async(resolve, reject) => {
    console.log(`function convert to usd`)
    try {
        const url = `https://api.polygon.io/v1/conversion/${from_currency}/${to_currency}?amount=${amount}&precision=2&apiKey=${POLY_API_KEY}`

        const result = await axios.get(url);

        if (result.status == 200) {
            console.log(result.data.converted)
            return resolve(result.data.converted)
        }
        return reject('Convert fail')
    } catch (err) {
        console.error(err)
        return reject(err)
    }
})