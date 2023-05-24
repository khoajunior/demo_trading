const fetch = require('node-fetch')
const {HASURA_ADMIN_SECRET, HASURA_URL} = require('../../constants/constants')

module.exports = (variables, query) => new Promise(async (resolve, reject) => {
    try{

        const options = {
            method: 'POST',
            headers: {'Content-Type': 'application/json', 'x-hasura-admin-secret': HASURA_ADMIN_SECRET},
            body: JSON.stringify({query, variables})
        }

        const response = await fetch(HASURA_URL, options)
        const result = await response.json()

        if(result.errors){
            return reject(result.errors[0].message)
        }
        return resolve(result)

    }catch(error){
        console.log(error)
        return reject(error)
    }
})