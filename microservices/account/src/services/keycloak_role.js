const { KEYCLOAK_URL, KEYCLOAK_REALM, KEYCLOAK_CLIENT, KEYCLOAK_USERNAME, KEYCLOAK_PASSWORD } = require('../../constants/constants')
const axios = require('axios')
const get_token = require('../helpers/get_token')

const get_client = (token) => new Promise(async(resolve, reject) => {
    try {
        const url = `${KEYCLOAK_URL}/auth/admin/realms/${KEYCLOAK_REALM}/clients`

        const { data: client_list } = await axios({
            url,
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": 'application/json'
            }
        })

        var client
        for (var i = 0; i < client_list.length; i++) {
            var client_id = client_list[i].clientId
            if (KEYCLOAK_CLIENT == client_id) {
                client = client_list[i]
                break;
            }
        }

        return resolve(client)

    } catch (error) {
        var err_msg = error
        if (!error) {
            err_msg = `get_client fail`
        }
        return reject(err_msg)
    }
})

const get_user_roles = (token, client_id, user_id) => new Promise(async(resolve, reject) => {
    try {
        const url = `${KEYCLOAK_URL}/auth/admin/realms/${KEYCLOAK_REALM}/users/${user_id}/role-mappings/clients/${client_id}`

        const { data: role_list } = await axios({
            url,
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        })

        return resolve(role_list)
    } catch (error) {
        var err_msg = error
        if (!error) {
            err_msg = `get_user_roles fail`
        }
        return reject(err_msg)
    }
})

const get_client_roles = (token, client_id) => new Promise(async(resolve, reject) => {
    try {
        const url = `${KEYCLOAK_URL}/auth/admin/realms/${KEYCLOAK_REALM}/clients/${client_id}/roles`

        const { data: role_list } = await axios({
            url,
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        })

        return resolve(role_list)
    } catch (error) {
        var err_msg = error
        if (!error) {
            err_msg = `get_client_roles fail`
        }
        return reject(err_msg)
    }
})

const delete_user_roles = (token, client_id, user_id) => new Promise(async(resolve, reject) => {
    try {
        const user_roles = await get_user_roles(token, client_id, user_id)
        const url = `${KEYCLOAK_URL}/auth/admin/realms/${KEYCLOAK_REALM}/users/${user_id}/role-mappings/clients/${client_id}`

        await axios({
            url,
            method: 'DELETE',
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": 'application/json'
            },
            data: JSON.stringify(user_roles)
        })

        return resolve('delete user role success')


    } catch (error) {
        return reject(error)
    }
})

const update_user_role = (token, user_id, new_role) => new Promise(async(resolve, reject) => {
    try {
        const client = await get_client(token)
        const client_id = client.id


        const client_roles = await get_client_roles(token, client_id)
        var set_role = []

        for (var i = 0; i < client_roles.length; i++) {
            if (client_roles[i].name == new_role) {
                set_role.push(client_roles[i])
                break
            }
        }

        if (set_role.length == 0) {
            return reject(`role: ${role} not found`)
        }

        await delete_user_roles(token, client_id, user_id)
        const url = `${KEYCLOAK_URL}/auth/admin/realms/${KEYCLOAK_REALM}/users/${user_id}/role-mappings/clients/${client_id}`

        const result = await axios({
            url,
            method: 'POST',
            data: set_role,
            headers: { 'Authorization': `Bearer ${token}` }
        })

        return resolve('update role for user success')

    } catch (error) {
        return reject(error)
    }
})

const check_role = (token, role) => new Promise(async(resolve, reject) => {
    try {
        var check = 1
        const client = await get_client(token)
        const client_id = client.id

        // console.log({ client_id })
        const client_roles = await get_client_roles(token, client_id)
            // console.log({ client_roles })

        var set_role = []

        for (var i = 0; i < client_roles.length; i++) {
            var client_role = client_roles[i]
            if (client_role.name === role) {
                set_role.push(client_role)
                break
            }
        }

        if (set_role.length == 0) {
            check = 0
        }
        return resolve(check)
    } catch (err) {
        return reject(err)
    }
})

const get_role_by_userId = (user_id) => new Promise(async(resolve, reject) => {
    try {
        var output_get_token = await get_token(KEYCLOAK_USERNAME, KEYCLOAK_PASSWORD)
        const admin_token = output_get_token.access_token
        const client = await get_client(admin_token)

        const role_list = await get_user_roles(admin_token, client.id, user_id)
        var role = []
        role_list.forEach(item => {
            role.push(item.name)
        })
        return resolve(role)
    } catch (err) {
        return reject(err)
    }
})

module.exports = {
    get_client,
    get_user_roles,
    get_client_roles,
    delete_user_roles,
    update_user_role,
    check_role,
    get_role_by_userId
}