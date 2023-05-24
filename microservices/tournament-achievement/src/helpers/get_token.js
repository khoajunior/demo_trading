const { GET_TOKEN_API_URL } = require('../../constants/constants')
const fetch = require('node-fetch')
module.exports = (username, password) => new Promise(async(resolve, reject) => {
    try {
        const details = {
            username,
            password,
            grant_type: 'password',
            client_id: 'client',
        }

        let formBody = []
        for (const property in details) {
            const encodedKey = encodeURIComponent(property)
            const encodedValue = encodeURIComponent(details[property])
            formBody.push(encodedKey + '=' + encodedValue)
        }
        formBody = formBody.join('&')
        const getTokenConfig = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
            },
            body: formBody,
        }

        const getTokenFetch = await fetch(GET_TOKEN_API_URL, getTokenConfig)

        if (getTokenFetch.status != 200) {
            console.log({ getTokenFetch })
            return reject('email or password invalid')
        }

        let result = await getTokenFetch.json()
        const output = {
            access_token: result.access_token,
            refresh_token: result.refresh_token
        }
        return resolve(output)

    } catch (error) {
        console.log(error)
        return reject('email or password invalid')
    }
})