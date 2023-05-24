const { USER_INFO_API_URL } = require('../../constants/constants')
const fetch = require('node-fetch')
const { get_client, get_user_roles, get_role_by_userId } = require('../services/keycloak_role')

module.exports = (access_token) => new Promise(async(resolve, reject) => {
    console.log(`function get user keycloak from token`, USER_INFO_API_URL)
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
            return reject('Phiên đăng nhập đã hết hạn')
        }

        const user = await userResponse.json()


        const role = await get_role_by_userId(user.sub)

        const format_user = {
            id: user.sub,
            email: user.email,
            email_verified: user.email_verified,
            username: user.preferred_username,
            role
        }
        return resolve(format_user)

    } catch (error) {
        console.log(error)
        return reject('thông tin người dùng không được tìm thấy')
    }
})