const getToken = require('../helpers/get_token')
const { get_user_from_username_or_email, get_user_hasura } = require('../services/hasura')
const { delete_old_session } = require('../services/handle_session_login')
const verify_captcha = require('../helpers/verify_captcha')
const jwt = require('jsonwebtoken')
const { increase_count_login } = require("../services/user")

module.exports = async (req, res) => {
    try {
        const { username, password } = req.body.input
        // await verify_captcha(captcha)

        var output_get_token = await getToken(username, password)
        var accessToken = output_get_token.access_token
        const { sub: user_id } = jwt.decode(accessToken)

        const user = await get_user_hasura(user_id)

        await delete_old_session({ user_id: user.id, new_session: output_get_token.session_state })

        //Update count_login = 0
        await increase_count_login({ user_id }, is_reset = true)

        return res.json({
            status: 200,
            message: 'Handle success',
            data: {
                ...user,
                access_token: accessToken,
                refresh_token: output_get_token.refresh_token,
            }
        })

    } catch (err) {
        if (err === `Bạn chưa xác thực email`) {
            return res.status(400).json({
                code: "email_not_verified",
                message: `${err}`,
            })
        }
        if (err === `Tên đăng nhập hoặc mật khẩu không chính xác`) {
            try {
                let { username } = req.body.input
                username = username.toLowerCase()
                const user = await get_user_from_username_or_email(username, username)

                //Nếu user đăng nhập sai thì nâng count_login lên thành 1
                const { count_login: updated_count_login } = await increase_count_login({ user_id: user.id })

                if (updated_count_login >= 5) {
                    return res.status(400).json({
                        code: "login_over_limit",
                        message: `${err}`,
                    })

                }
            } catch (error) {
                return res.status(400).json({
                    code: "handle_fail",
                    message: `${error}`,
                })
            }

        }
        return res.status(400).json({
            code: "handle_fail",
            message: `${err}`,
        })
    }
}
