const { send_email } = require('../services/email')
const { create_random_code, check_random_code } = require('../helpers/random_code')
const { update_code, get_user_from_username_or_email } = require('../services/hasura')
const { update_verify_email } = require('../services/keycloak')
const ACTION = `gửi email xác nhận thất bại`
const VERIFY_EMAIL_ACTION = 'Xác nhận email thất bại'

//Send verify email
//req: email
const send_verify_email = async (req, res) => {
    try {
        const { email, username } = req.body.input
        // const { email } = req.body
        const format_email = email ? email.toLowerCase() : email
        const format_username = username ? username.toLowerCase() : username
        let { email: email_input } = await get_user_from_username_or_email(format_email, format_username)

        //create new random code
        const code = await create_random_code()
        if (!code.random_number || !code.hash) {
            return res.json({ status: 400, message: 'Fail when create verify code', data: null })
        }


        //update hash code in hasura
        await update_code({
            email: email_input,
            code: code.hash
        })

        //send email
        const item = {
            email: email_input,
            code: code.random_number
        }

        const result = await send_email(item)
        return res.json({ status: 200, message: 'Handle success', data: null })
    } catch (err) {
        console.error(err)
        return res.status(400).json({
            code: "handle_fail",
            message: `${ACTION}: ${err}`,
        })
    }
}

//Hanlde verify
//req: code(user nhập)
const verify_email = async (req, res) => {
    try {
        const { code: hexString } = req.body.input
        // const { code: hexString } = req.body

        const data = Buffer.from(hexString, 'hex').toString('utf8')

        const { code, email } = JSON.parse(data)
        const format_email = email.toLowerCase()

        //get hash string in db        
        const user = await get_user_from_username_or_email(format_email, format_email)

        const result = await check_random_code(code, user.code, user.exp_time)
        // console.log({ result })

        const check_permission = await update_verify_email({ email })
        if (check_permission.status != 204) {
            return res.json({ status: 400, message: 'Update verify email in keycloak fail', data: null })
        }

        await update_code({ email: format_email, code: null })

        return res.json({ status: 200, message: 'Handle success', data: result })
    } catch (err) {
        if (err.message) {
            err = err.message
        }
        return res.status(400).json({
            code: "handle_fail",
            message: `${VERIFY_EMAIL_ACTION}: ${err}`,
        })
    }
}

module.exports = {
    send_verify_email,
    verify_email
}