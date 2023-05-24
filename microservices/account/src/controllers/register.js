const create_account = require('../helpers/create_account')
const { create_user_profile, on_board, get_user_profile } = require('../services/user')
const { get_user_by_email } = require('../helpers/handler_keycloak')
const { update_user_role } = require('../services/keycloak_role')
const { KEYCLOAK_USERNAME, KEYCLOAK_PASSWORD, ROLE_USER, EMAIL_EXISTED, USERNAME_EXISTED,
    ROLE_ADMIN, ROLE_HASURA_ADMIN, USER_EXIST, USER_PROFILE, ROLE_MANAGER, LIMIT_USER_IN_BRAND
} = require('../../constants/constants')
const get_token = require('../helpers/get_token')
const check_field_duplicate = require('../services/check_field_duplicate')
const ACTION = `Đăng ký tài khoản không thành công`
const ACTION_ONBOARD = 'Cập nhật tài khoản không thành công'
const { redis_db } = require('../core/redis_db')
const join_tournament_default = require('../services/join_tournament_default')
const { handle_verify_otp } = require('../services/otp')
const verify_captcha = require('../helpers/verify_captcha')
const get_brand_by_id = require('../services/get_brand_by_id')


// username, email, password ,fullname, role(nếu null -> mặc định user)
const register_controller = async (req, res) => {
    try {
        const item = req.body.input
        const { email, national_id, fullname, phone_number, gender, birthday, career, code, username, password, captcha } = item
        const session_variables = req.body.session_variables
        const user_role = session_variables['x-hasura-role']
        item.created_by = session_variables['x-hasura-user-id'] || null
        item.is_verify = false
        item.is_changed_password = false
        item.is_verify_otp = false

        var role = ROLE_USER

        // super admin create user and manager and super_admin
        if (user_role == ROLE_HASURA_ADMIN || user_role == ROLE_ADMIN) {
            role = item.role
            item.is_verify = true
            item.is_verify_otp = true

            if (role === ROLE_USER) {
                item.is_changed_password = true
            }
        }

        //manager only create manager in brand_id
        if (user_role == ROLE_MANAGER) {
            role = ROLE_MANAGER
            item.is_verify = true
            item.is_verify_otp = true

            const manager_owner = await get_user_profile(item.created_by)

            item.brand_id = manager_owner.brand_id

        }


        // check brand only 3 member
        if (item.brand_id) {
            const check_brand = await get_brand_by_id(item.brand_id)

            if (!check_brand) {
                return res.status(400).json({
                    code: "brand_not_found",
                    message: `${item.brand_id}: không tồn tại`,
                })

            }

            const number_user_in_brand = check_brand.user_profiles_aggregate.aggregate.count
            if (number_user_in_brand > LIMIT_USER_IN_BRAND) {
                return res.status(400).json({
                    code: "limit_user_brand",
                    message: `Bạn không thể tạo thêm người dùng vào brand số lượng tối đa: ${LIMIT_USER_IN_BRAND}`,
                })
            }
        }


        if (user_role != ROLE_HASURA_ADMIN && user_role != ROLE_ADMIN && user_role != ROLE_MANAGER) {
            await verify_captcha(captcha)
        }

        if (national_id) {
            await check_field_duplicate(`national_id`, national_id)
        }
        item.role = role

        var output_get_token = await get_token(KEYCLOAK_USERNAME, KEYCLOAK_PASSWORD)
        const admin_token = output_get_token.access_token

        //create account keycloak
        await create_account(admin_token, item)

        //get user register in keycloak
        const user = await get_user_by_email(email)

        //create role
        const user_id = user[0].id
        await update_user_role(admin_token, user_id, role)

        const user_input = {
            ...user[0],
            role,
            fullname,
            brand_id: item.brand_id,
            phone_number,
            gender,
            birthday,
            career,
            national_id,
            is_changed_password: item.is_changed_password,
            is_verify_otp: item.is_verify_otp,
            created_by: item.created_by
        }

        const result = await create_user_profile(user_input)
        const new_user_token = await get_token(username, password)
        result.access_token = new_user_token.access_token
        result.refresh_token = new_user_token.refresh_token

        if (item.code && item.phone_number) {
            try {
                await handle_verify_otp({
                    phone_number,
                    code,
                    user_id
                })
            } catch (err) {
                console.error(err)
            }
        }

        const user_info = result.user
        // save user_info to redis
        await redis_db.hmsetAsync(USER_PROFILE, user_id, JSON.stringify(user_info))

        await join_tournament_default(user_id)

        return res.json({ status: 200, message: 'Handle success', data: result })
    } catch (err) {
        console.error(err)
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

//Input: user_id,role,fullname
const onBoard = async (req, res) => {
    try {
        const { user_id } = req.body.input
        const result = await on_board(user_id) //TODO: thiếu fullname + role

        // save user_info to redis
        await redis_db.hmsetAsync(USER_PROFILE, user_id, JSON.stringify(result))
        await join_tournament_default(user_id)

        return res.json({ status: 200, message: 'Handle success', data: result })
    } catch (err) {
        return res.status(400).json({
            code: "handle_fail",
            message: `${ACTION_ONBOARD}: ${err}`,
        })
    }
}

module.exports = {
    register_controller,
    onBoard
}