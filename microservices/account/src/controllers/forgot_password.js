const { create_random_code, check_random_code } = require('../helpers/random_code')
const { update_code, get_user_from_username_or_email } = require('../services/hasura')
const { update_password } = require('../services/keycloak_password')
const { send_email } = require('../services/email')

const send_email_forgot_password = async (req, res) => {
    try {
        const { email, username } = req.body.input
        const format_email = email ? email.toLowerCase() : email
        const format_username = username ? username.toLowerCase() : username
        let { email: email_input } = await get_user_from_username_or_email(format_email, format_username)

        const code = await create_random_code()
        if (!code.random_number || !code.hash) {
            return res.status(400).json({
                code: 'generate_code',
                message: 'Tạo mã xác nhận thất bại'
            })
        }

        await update_code({ email: email_input, code: code.hash })
        const email_item = { email: email_input, code: code.random_number }
        const result = await send_email(email_item, false)

        return res.json({ status: 200, message: 'Handle success', data: result })
    } catch (err) {
        console.error(err)
        if (err.message) {
            err = err.message
        }
        return res.status(400).json({
            code: 'send_email_fail',
            message: "Gửi mail xác nhận thất bại"

        })
    }
}

//input: code, new_password
const verify_forgot_password = async (req, res) => {
    try {
        const { code: hexString, new_password } = req.body.input
        const data = Buffer.from(hexString, 'hex').toString('utf8')
        const { code, email } = JSON.parse(data)
        const format_email = email.toLowerCase()

        //get hash string in db        
        const user = await get_user_from_username_or_email(format_email, format_email)
        await check_random_code(code, user.code, user.exp_time)

        const result = await update_password({ email, new_password })
        if (result.status != 204) {
            return res.status(400).json({
                code: "update_password",
                message: "Cập nhật mật khẩu thất bại"
            })
        }
        await update_code({ email: format_email, code: null })

        return res.json({ status: 200, message: 'Handle success', data: null })
    } catch (err) {
        console.error(err)
        if (err.message) {
            err = err.message
        }
        return res.status(400).json({
            code: "handle_fail",
            message: `Mã đặt lại mật khẩu không hợp lệ`,
        })
    }
}

module.exports = {
    send_email_forgot_password,
    verify_forgot_password
}