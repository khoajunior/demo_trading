const { USER_API_URL } = require('../../constants/constants')
const fetch = require('node-fetch')
const { check_role } = require('../services/keycloak_role')

//input: adminToken, item: username, email, password, role
module.exports = (adminToken, user) => new Promise(async(resolve, reject) => {
    console.log(`function create account`)
    try {
        const { username, email, password, role } = user

        const valid_role = await check_role(adminToken, role)
        if (valid_role == 0) {
            return reject(`Role: ${role} not found`)
        }

        user = {
            username,
            email,
            password,
            enabled: true,
            emailVerified: false,
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
        const message = result.error || result.errorMessage

        return reject(message)

    } catch (error) {
        // console.log(error)
        return reject(error)
    }
})