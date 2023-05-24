const { KEYCLOAK_USERNAME, KEYCLOAK_PASSWORD, USER_API_URL } = require('../../constants/constants')
const fetch = require('node-fetch')
const { check_role } = require('../services/keycloak_role')

//input: adminToken, item: username, email, password, role
module.exports = (adminToken, user) => new Promise(async(resolve, reject) => {
    try {
        const { username, email, password, role, is_verify = false } = user

        const valid_role = await check_role(adminToken, role)
        if (valid_role == 0) {
            return reject(`Role: ${role} không tồn tại`)
        }

        user = {
            username,
            email,
            password,
            enabled: true,
            emailVerified: is_verify,
            origin: 'web-api'
        }

        // Handle password
        const user_keycloak = JSON.parse(JSON.stringify(user))
        user_keycloak.credentials = [{
            type: 'password',
            value: user.password,
            temporary: false,
        }, ]
        delete user_keycloak.password

        const createUserConfig = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${adminToken}`
            },
            body: JSON.stringify(user_keycloak)
        }

        const createUser = await fetch(USER_API_URL, createUserConfig)

        if (createUser.status == 201) {
            return resolve('Handle success')
        }

        const result = await createUser.json()

        const message = result.error || result.errorMessage //TODO: sửa lại thành trả về user

        return reject(message)

    } catch (error) {
        console.log({error})
        return reject('Tạo tài khoản thất bại')
    }
})