const { GET_TOKEN_API_URL } = require('../../constants/constants')
const fetch = require('node-fetch')
module.exports = (username, password) => new Promise(async (resolve, reject) => {
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
        let result = await getTokenFetch.json()

        if (result.error) {
            if (result.error_description === `Account is not fully set up`) {
                return reject(`Bạn chưa xác thực email`)
            }
            console.log(result.error)
            return reject('Tên đăng nhập hoặc mật khẩu không chính xác')
        }

        const output = {
            access_token: result.access_token,
            refresh_token: result.refresh_token,
            session_state: result.session_state
        }
        return resolve(output)
        // return resolve(result.access_token)

    } catch (error) {
        console.log(error)
        return reject('Tên đăng nhập hoặc mật khẩu không chính xác')
    }
})