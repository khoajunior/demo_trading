const keyloak = require('../services/keycloak')
const hasura = require('../services/hasura')
const get_token = require('../helpers/get_token')
const { KEYCLOAK_USERNAME, KEYCLOAK_PASSWORD, EMAIL_EXISTED, USERNAME_EXISTED, USER_EXIST, ROLE_MANAGER } = require('../../constants/constants')
const keycloak_role = require('../services/keycloak_role')
const ACTION = `Admin cập nhật thông tin người dùng`
const { get_user_profile } = require('../services/user')

//req: user_id, new_username,new_fullname, role,new_ticket => for admin
module.exports = async (req, res) => {
    console.log(`API update user`)
    try {
        const item = req.body.input

        const { session_variables } = req.body
        const personal_id = session_variables['x-hasura-user-id']
        const personal_role = session_variables['x-hasura-role']
        const { user_id, new_username, role, new_fullname, new_ticket, new_email } = item


        // allow user update
        if (personal_role == ROLE_MANAGER && personal_id != user_id) {
            const personal = await get_user_profile(personal_id)

            if (personal.is_deleted) {
                return res.status(400).json({
                    code: "manager_is_deleted",
                    message: `${ACTION}: ${personal_id} đã bị xóa`,
                })
            }

            const check_user = await get_user_profile(user_id)

            console.log({ personal, check_user })

            const { brand_id } = personal
            console.log({ brand_id })
            if (!brand_id || brand_id != check_user.brand_id) {
                return res.status(400).json({
                    code: "manager_not_permission",
                    message: `${ACTION}: ${personal_id} không có quyền chỉnh thông tin của ${user_id}`,
                })
            }

            if (check_user.is_deleted) {
                return res.status(400).json({
                    code: "user_is_deleted",
                    message: `${ACTION}: ${user_id} đã bị xóa`,
                })
            }
        }

        if (new_username || new_email) {
            await keyloak.update_username_email(item)
        }

        if (role) {
            var output_get_token = await get_token(KEYCLOAK_USERNAME, KEYCLOAK_PASSWORD)
            const admin_token = output_get_token.access_token
            await keycloak_role.update_user_role(admin_token, user_id, role)
        }

        //Update in hasura
        const new_user = await hasura.update_user(item)

        return res.json({ status: 200, message: 'Handle success', data: new_user })
    } catch (err) {
        let message = err
        switch (err) {
            case EMAIL_EXISTED:
                message = `Email đã được đăng ký ở tài khoản khác`
                break;
            case USERNAME_EXISTED:
                message = `Tên đăng nhập đã được đăng ký ở tài khoản khác`
                break;
            case USER_EXIST:
                message = `Email hoặc tên đăng nhập đã được đăng ký ở tài khoản khác`
                break;
            default:
                break;
        }

        return res.status(400).json({
            code: "handle_fail",
            message: `${ACTION}: ${message}`,
        })
    }
}