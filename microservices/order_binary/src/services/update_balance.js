const handler_hasura = require('../helpers/handler_hasura')

module.exports = (user_id, new_balance, update_type = '_set') => new Promise((resolve, reject) => {
    try {
        const UPDATE_BALANCE = `mutation MyMutation ($user_id: uuid!, $new_balance:float8!){ 
            update_demo_account(where: {user_id: {_eq: $user_id}}, ${update_type}: {balance: $new_balance}) {
                returning {
                    balance
                    created_at
                    id
                    updated_at
                    user_id
                    user_profile {
                    name
                    id
                    email
                    }
                }
                }
            }`

        const variables = {
            user_id,
            new_balance
        }

        await handler_hasura(variables, UPDATE_BALANCE)
        return resolve('update balance for account demo success')

    } catch (error) {
        console.log(error)
        return reject(error)
    }
})