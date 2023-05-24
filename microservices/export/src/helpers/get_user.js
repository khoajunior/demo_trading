const { USER_INFO_API_URL } = require('../../constants/constants')
const fetch = require('node-fetch')

module.exports = (access_token) => new Promise(async(resolve, reject) => {
    console.log(`function get user from token`)
    try {
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${access_token}`
            }
        }
        const userResponse = await fetch(USER_INFO_API_URL, options)

        if (userResponse.status != 200) {
            return reject('jwt invalid')
        }

        const user = await userResponse.json()

        const format_user = {
            id: user.sub,
            email_verified: user.email_verified,
            username: user.preferred_username,
            email: user.email
        }
        return resolve(format_user)

    } catch (error) {
        console.log(error)
        return reject(error)
    }
})