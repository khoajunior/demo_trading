const { USER_API_URL, KEYCLOAK_USERNAME, KEYCLOAK_PASSWORD } = require('../../constants/constants')
const fetch = require('node-fetch')
const getToken = require('../helpers/get_token')
const { get_user_by_email } = require('../helpers/handler_keycloak')

const update_password = (item) => new Promise(async(resolve, reject) => {
    try {
        const { email, new_password } = item
        const user = await get_user_by_email(email)
        const { access_token } = await getToken(KEYCLOAK_USERNAME, KEYCLOAK_PASSWORD)
        
        let options = {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${access_token}`
            },
            body: JSON.stringify({
                type: "password",
                temporary: false,
                value: new_password
            })
        }
        const url = `${USER_API_URL}/${user[0].id}/reset-password`
        const result = await fetch(url, options)

        return resolve(result)
    } catch (err) {
        console.error(err)
        return reject(err)
    }
})


const reset_password = (email, old_password, new_password) => new Promise(async(resolve, reject) => {
    try {
        //check old password true
        await getToken(email, old_password)

        await update_password({email, new_password})

        return resolve('Cập nhật mật khẩu thành công.')

    } catch (error) {
        console.log(error)
        let err_msg=error
        if(error==`Tài khoản hoặc mật khẩu không đúng`){
            err_msg=`Mật khẩu cũ không đúng`
        }
        return reject(error)
    }
})

//Input: email,new_password

module.exports = {
    reset_password,
    update_password
}