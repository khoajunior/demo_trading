const handler_hasura = require('../helpers/handler_hasura')
const { TIME_EXPIRE, HASURA_ADMIN_SECRET, HASURA_URL } = require('../../constants/constants')

//item: user_id, new_username, new_fullname, role,ticket
const update_user = (item) => new Promise(async (resolve, reject) => {
    try {
        const {
            user_id, new_username, new_fullname, role, new_ticket,
            phone_number, gender, birthday, career, national_id,
            avatar, front_url_national_id, back_url_national_id, new_email,
            is_verified_otp,
            is_deleted,
        } = item


        var variables = {
            id: user_id,
            updated_at: new Date().toISOString()
        }

        //new_username
        let query = `updated_at: $updated_at, `
        let INSERT_HISTORY_USERNAME = ``
        if (new_username) {
            query += `username: $username,`
            variables.username = new_username.toLowerCase()
            //Thêm username cũ vào bảng history_username
            const pre_user = await get_user_hasura(user_id)
            variables.old_username = pre_user.username
            INSERT_HISTORY_USERNAME = `insert_history_username(objects: {old_username: $old_username, user_id: $id}) {
                returning {
                  id
                  user_id
                  old_username
                }
            }`
        }

        if (new_email) {
            query += `email: $email, `
            variables.email = new_email
        }

        //new_fullname

        if (new_fullname) {
            query += ` name: $fullname,`
            variables.fullname = new_fullname
        }

        //new_role
        if (role) {
            query += ` role: $role,`
            variables.role = role
        }

        //new ticket
        if (new_ticket) {
            query += ` ticket: $ticket,`
            variables.ticket = new_ticket
        }

        if (phone_number) {
            query += ` phone_number: $phone_number,`
            variables.phone_number = phone_number
        }


        if (birthday) {
            query += ` birthday: $birthday,`
            variables.birthday = birthday
        }
        if (career) {
            query += ` career: $career,`
            variables.career = career
        }


        if (gender) {
            query += ` gender: $gender,`
            variables.gender = gender
        }

        if (back_url_national_id != null) {
            query += ` back_url_national_id: $back_url_national_id,`
            variables.back_url_national_id = back_url_national_id
            if (back_url_national_id == '') {
                variables.back_url_national_id = null
            }

        }

        if (front_url_national_id != null) {
            query += ` front_url_national_id: $front_url_national_id,`
            variables.front_url_national_id = front_url_national_id
            if (front_url_national_id == '') {
                variables.front_url_national_id = null
            }
        }

        if (avatar != null) {
            query += ` avatar: $avatar,`
            variables.avatar = avatar
            if (avatar == '') {
                variables.avatar = null
            }
        }


        if (national_id) {
            // await check_field_duplicate(`national_id`, national_id)
            query += ` national_id: $national_id,`
            variables.national_id = national_id
        }

        if (is_verified_otp === false || is_verified_otp === true) {
            query += ` is_verified_otp: $is_verified_otp,`
            variables.is_verified_otp = is_verified_otp
        }



        if (is_deleted === false || is_deleted === true) {
            query += ` is_deleted: $is_deleted,`
            variables.is_deleted = is_deleted
        }


        //update in hasura
        const my_mutation = `mutation MyMutation(
                $id:uuid, $username: String, $fullname:String, $role: String, $ticket: Int, $phone_number: String, 
                $birthday: timestamptz, $career: String, $gender: String,$national_id: String,
                $avatar: String, $front_url_national_id: String, $back_url_national_id: String, 
                $email: String, $is_verified_otp: Boolean, $old_username: String, $is_deleted: Boolean, $updated_at: timestamptz
            ) {
            update_user_profile(where: {id: {_eq: $id}}, 
                _set: {${query}
            }) {
                returning {
                    id
                    name
                    username
                    email
                    avatar
                    brand {
                        created_at
                        id
                        name
                        updated_at
                    }
                    brand_id
                    role
                    ticket
                    is_deleted
                    phone_number
                    gender
                    career
                    birthday
                    front_url_national_id
                    back_url_national_id
                    national_id
                }
            }
            ${INSERT_HISTORY_USERNAME}     
        }
        `

        // console.log({variables})
        const result = await handler_hasura(variables, my_mutation)
        if (result.data.update_user_profile.returning.length == 0) {
            return reject(`Người dùng với ${user_id} không tồn tại`)
        }
        return resolve(result.data.update_user_profile.returning[0])
    } catch (err) {
        return reject(err)
    }
})

const get_user_hasura = (user_id) => new Promise(async (resolve, reject) => {
    try {
        const GET_USER = `query MyQuery($user_id: uuid) {
            user_profile(where: {id: {_eq: $user_id}}) {
              id
              avatar
              name
              email
              level
              role
              username
              code
              exp_time
              front_url_national_id
              back_url_national_id
              national_id
              is_verified_otp 
              phone_number
            }
          }
          `
        const variables = {
            user_id
        }

        const result = await handler_hasura(variables, GET_USER)

        if (!result.data.user_profile[0]) {
            return reject(`Người dùng với: ${user_id} không tồn tại`)
        }

        return resolve(result.data.user_profile[0])
    } catch (err) {
        return reject(err)
    }
})

//Input: email,code
const update_code = (item) => new Promise(async (resolve, reject) => {
    try {
        const { email, code } = item
        const current_time = Math.floor((new Date()).getTime() / 1000)
        const exp_time = current_time + TIME_EXPIRE
        const time = new Date(exp_time * 1000)

        const UPDATE_CODE = ` mutation MyMutatio($email: String, $code: String,$exp_time: timestamptz) {
            update_user_profile(where: {email: {_eq: $email}}, _set: {code: $code,exp_time: $exp_time}) {
              returning {
                id
                code
                exp_time
              }
            }
          }          
          `

        const variables = {
            email,
            code,
            exp_time: time
        }

        const result = await handler_hasura(variables, UPDATE_CODE)
        if (result.data.update_user_profile.length == 0) {
            console.log(`User with email: ${email} not found`)
            return reject(`Người dùng với: ${email} không tồn tại`)
        }
        return resolve(result.data.update_user_profile.returning[0])
    } catch (err) {
        return reject(err)
    }
})

const get_user_from_username_or_email = (email, username) => new Promise(async (resolve, reject) => {
    try {
        const GET_USER = `query MyQuery($username: String, $email: String) {
            user_profile(where: {_or: [
                {username: {_eq: $username}},
                {email: {_eq: $email}}
            ]}) {
              avatar
              id
              name
              email
              level
              role
              username
              code
              exp_time
              front_url_national_id
              back_url_national_id
              national_id
            }
          }
          `

        const variables = {
            username: username || '',
            email: email || ''
        }

        const result = await handler_hasura(variables, GET_USER)

        if (!result.data.user_profile[0]) {
            return reject(`Người dùng không tồn tại username:${username} hoặc ${email}`)
        }

        return resolve(result.data.user_profile[0])
    } catch (err) {
        console.error(err)
        return reject(err)
    }
})

const fetch_Hasura = async (query, variables) => {
    return await fetch(HASURA_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-hasura-admin-secret': HASURA_ADMIN_SECRET
        },
        body: JSON.stringify({
            query: query,
            variables: variables
        })
    }).then(json => json.json())
      .then(json => json);
}

module.exports = {
    update_user,
    get_user_hasura,
    update_code,
    get_user_from_username_or_email,
    fetch_Hasura
}
