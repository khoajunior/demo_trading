const { USER_API_URL, KEYCLOAK_USERNAME, KEYCLOAK_PASSWORD } = require('../../constants/constants')
const fetch = require('node-fetch')
const getToken = require('./get_token')

const get_user_by_userId = (user_id) => new Promise(async(resolve, reject) => {
    try {
        //get user by user_id
        var output_get_token = await getToken(KEYCLOAK_USERNAME, KEYCLOAK_PASSWORD)
        const accessToken = output_get_token.access_token

        const getUserId = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`
            }
        }

        const getUserFetch = await fetch(
            `${USER_API_URL}/${user_id}`,
            getUserId
        )

        const user = await getUserFetch.json()
        return resolve(user)
    } catch (err) {
        console.error(err)
        return reject(`Thông tin người dùng theo id không tồn tại`)
    }
})

const get_user_by_email = (email) => new Promise(async(resolve, reject) => {
    try {
        //get user by user_id
        var output_get_token = await getToken(KEYCLOAK_USERNAME, KEYCLOAK_PASSWORD)
        const accessToken = output_get_token.access_token

        const getUserId = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`
            }
        }

        const getUserFetch = await fetch(
            `${USER_API_URL}/?email=${email}`,
            getUserId
        )

        const keycloak_user_list = await getUserFetch.json()

        const user_list  = []

        for(var i = 0; i < keycloak_user_list.length; i ++){
            const user = keycloak_user_list[i]

            if(user.email == email.toLowerCase()){
                user_list.push(user)
                break
            }
        }
        return resolve(user_list)
    } catch (err) {
        console.error(err)
        return reject(`Thông tin người dùng theo email không tồn tại`)
    }
})

module.exports = {
    get_user_by_userId,
    get_user_by_email
}