const {delete_user_keycloak}=require("../services/keycloak")
const {update_user_deleted}=require('../services/user')

//req: username, old_password, new_password
module.exports = async (req, res) => {
    try {
        const { user_id } = req.body.input

        await delete_user_keycloak(user_id)

        //update trạng thái is_deleted trong hasura
        const result = await update_user_deleted({user_id})

        return res.json({ status: 200, message: 'Handle success', data: result })
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