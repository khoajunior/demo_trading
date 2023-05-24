const keyloak = require('../services/keycloak')
const hasura = require('../services/hasura')
const {EMAIL_EXISTED,USERNAME_EXISTED,USER_EXIST, USER_PROFILE} = require('../../constants/constants')
const { redis_db } = require('../core/redis_db')
const ACTION = `Cập nhật thông tin người dùng không thành công`


//req: new_username,new_fullname
module.exports = async (req, res) => {
    console.log(`API user update username`)
    try {
        const session_variables = req.body.session_variables
        const user_id = session_variables['x-hasura-user-id']
        // const user_id = `38bd2980-cd89-451a-94a8-9491c30dbf0c`

        const item = req.body.input
        // const item = req.body

        const { new_username, new_email } = item
        item.user_id = user_id

        if (new_username || new_email ) {
            await keyloak.update_username_email(item)
        }

        //Update in hasura
        const result = await hasura.update_user(item)

        // save user to redis
        await redis_db.hmsetAsync(USER_PROFILE, user_id, JSON.stringify(result))

        return res.json({ status: 200, message: 'Handle success', data: result })
    } catch (err) {
        let message=err
        switch (err) {
            case EMAIL_EXISTED:
                message=`Email đã được đăng ký ở tài khoản khác`
                break;
            case USERNAME_EXISTED:
                message=`Tên đăng nhập đã được đăng ký ở tài khoản khác`
                break;
            case USER_EXIST:
                message=`Email hoặc tên đăng nhập đã được đăng ký ở tài khoản khác`
                break;
            default:
                break;
        }
        
        return res.status(400).json({
            code: "handle_fail",
            message: `${message}`,
        })
    }
}