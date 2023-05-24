const { reset_password } = require('../services/keycloak_password')
const { get_user_profile } = require('../services/user')
const ACTION = `Thay đổi mật khẩu thất bại`

//req: username, old_password, new_password
module.exports = async (req, res) => {
    try {
        const { old_password, new_password } = req.body.input
        const { session_variables } = req.body
        const user_id = session_variables['x-hasura-user-id']

        const { email } = await get_user_profile(user_id)

        const result = await reset_password(email, old_password, new_password)

        return res.json({ status: 200, message: 'Handle success', data: true })
    } catch (err) {
        var err_msg = err
        if (!err) {
            err_msg = `Reset password fail`
        }
        return res.status(400).json({
            code: "handle_fail",
            message: `${err}`,
        })
    }
}