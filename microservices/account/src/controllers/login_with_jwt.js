const get_user = require("../helpers/get_user")
const { get_user_hasura } = require('../services/hasura')
const ACTION = 'Đăng nhập với token thất bại'

module.exports = async (req, res) => {
    try {
        const { access_token } = req.body.input
        const user = await get_user(access_token)
        const user_info = await get_user_hasura(user.id)

        return res.json({ status: 200, message: 'Handle success', data: user_info })
    } catch (err) {
        return res.status(400).json({
            code: "handle_fail",
            message: `${ACTION}: ${err}`,
        })
    }
}