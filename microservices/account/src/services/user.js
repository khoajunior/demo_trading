const handler_hasura = require('../helpers/handler_hasura')
const { TIME_EXPIRE, DEFAULT_TICKET } = require('../../constants/constants')
const { get_user_by_userId } = require('../helpers/handler_keycloak')

const UPDATE_NATIONAL_CARD = `mutation MyMutation ($id: uuid, $back_url_national_id: String, $front_url_national_id: String, $national_id: String, $current_time: timestamptz){
    update_user_profile(where: {id: {_eq: $id}}, _set: {back_url_national_id: $back_url_national_id, front_url_national_id: $front_url_national_id, national_id: $national_id, updated_at: $current_time}) {
      returning {
        avatar
        back_url_national_id
        birthday
        career
        created_at
        email
        front_url_national_id
        gender
        id
        name
        level
        national_id
        phone_number
        role
        status
        ticket
        username
        updated_at
      }
    }
  }
  `
const create_user_profile = (user) => new Promise(async (resolve, reject) => {
    try {
        const { 
            id, fullname, username, email, role, brand_id, birthday, 
            phone_number, career, gender,national_id, is_verified_otp, code,
            is_changed_password, created_by
        } = user
        const ticket = user.ticket || DEFAULT_TICKET

        const current_time = Math.floor((new Date()).getTime() / 1000)
        const exp_time = current_time + TIME_EXPIRE
        const time = new Date(exp_time * 1000)

        const variables = {
            user_id: id,
            username,
            email,
            fullname,
            code: code || null,
            exp_time: time,
            ticket,
            is_verified_otp: is_verified_otp || false,
            is_changed_password,
        }

        let query_more= ``
        if (role) {
            query_more += ` role: $role,`
            variables.role = role
        }

        if(created_by){
            query_more += `created_by: $created_by, `
            variables.created_by = created_by
        }

        if ( brand_id) {
           query_more += ` brand_id: $brand_id,`
            variables.brand_id =  brand_id
        }
      
        if (phone_number) {
           query_more += ` phone_number: $phone_number,`
            variables.phone_number = phone_number
        }
   
        if (birthday) {
            query_more += ` birthday: $birthday,`
            variables.birthday = birthday
        }

        if (career) {
            query_more += ` career: $career,`
            variables.career = career
        }

        if (gender) {
            query_more += ` gender: $gender,`
            variables.gender = gender
        }

        if (national_id) {            
            query_more += ` national_id: $national_id,`
            variables.national_id = national_id
        }

        //create user_profiles
        const my_mutation = `mutation MyMutation(
                $user_id: uuid,$username: String,$email: String, $role: String,
                $fullname: String,$code: String, $exp_time: timestamptz,$ticket: Int, 
                $brand_id: uuid, $gender: String, $birthday: timestamptz, 
                $phone_number: String, $career: String, $national_id: String,
                $is_verified_otp: Boolean,  $created_by: uuid, $is_changed_password: Boolean) 
            {
            insert_user_profile(objects: {
                id: $user_id, email: $email,${query_more} name: $fullname, username: $username,
                code: $code,exp_time: $exp_time,ticket: $ticket, is_verified_otp: $is_verified_otp,
                is_changed_password: $is_changed_password
            }) {
              returning {
                brand_id
                brand {
                    created_at
                    id
                    name
                    updated_at
                }
                id
                name
                username
                avatar
                email
                role
                code
                ticket
                phone_number
                gender
                career
                birthday
                front_url_national_id
                back_url_national_id
                national_id
                is_verified_otp
                created_by
                is_changed_password
                created_by_profile {
                    id
                    role
                    name
                    email
                    username
                    brand_id
                }
              }
            }            
        }`
      
        const result = await handler_hasura(variables, my_mutation)

        const profile = result.data.insert_user_profile.returning[0]
        const data = {
            user: profile,
        }
        return resolve(data)
    } catch (err) {
        console.log({err})
        return reject(err)
    }
})

const on_board = (user_id) => new Promise(async (resolve, reject) => {
    try {
        //get user by user_id
        let user = await get_user_by_userId(user_id)

        //create user in hasura
        const result = await create_user_profile(user)

        return resolve(result)
    } catch (err) {
        return reject(err)
    }
})

const get_user_profile = (user_id) => new Promise(async (resolve, reject) => {
    try {
        const GET_USER_PROFILE = `query MyQuery($user_id: uuid) {
            user_profile(where: {id: {_eq: $user_id}}) {
                avatar
                is_verified_otp
                created_at
                email
                exp_time
                id
                level
                name
                role
                ticket
                updated_at
                username
                code
                front_url_national_id
                back_url_national_id
                national_id
                brand_id
                is_deleted
            }
          }
          `
        const variables = {
            user_id
        }

        const result = await handler_hasura(variables, GET_USER_PROFILE)
        if (result.data.user_profile.length == 0) {
            return reject(`User ${user_id} not found`)
        }
        return resolve(result.data.user_profile[0])
    } catch (err) {
        console.error(err)
        return reject(err)
    }
})

const check_user_profile_valid = (user_id) => new Promise(async(resolve,reject)=>{
    try{
        const user=await get_user_profile(user_id)

        const {front_url_national_id,back_url_national_id,role,national_id, is_verified_otp}=user
        if(role!=`user`){
            return resolve(user)
        }

        // if(!is_verified_otp){
        //     return reject("Bạn chưa xác nhận số điện thoại")
        // }

        if(!front_url_national_id){
            return reject('Bạn chưa cập nhật mặt trước chứng minh thư')
        }
        if(!back_url_national_id){
            return reject('Bạn chưa cập nhật mặt sau chứng minh thư')
        }
        if(!national_id){
            return reject('Bạn chưa cập nhật số chứng minh thư')
        }
        return resolve(user)
    }catch(err){
        console.log({err})
        return reject(err)
    }
})


const update_national_card = (item) => new Promise(async (resolve, reject) => {
    try{
        const variables = {
            front_url_national_id: item.front_url_national_id,
            back_url_national_id: item.back_url_national_id,
            national_id: item.national_id,
            current_time: new Date().toISOString(),
            id: item.user_id

        }
        const {data} = await handler_hasura(variables, UPDATE_NATIONAL_CARD)

        return resolve(data.update_user_profile.returning[0])


    }catch(error){
        console.log(error)
        return reject("Số chứng minh thư đã được dùng cho tài khoản khác")
    }
})

const update_user_deleted = (item) => new Promise(async(resolve,reject)=>{
    try{
        const UPDATE_DELETE_STATUS = `mutation MyMutation($user_id:uuid!) {
            update_user_profile(where: {id: {_eq: $user_id}}, _set: {is_deleted: true}) {
              returning {
                id
                email
                name
                national_id
                is_deleted
              }
            }
          }
          `
        const result = await handler_hasura({user_id: item.user_id},UPDATE_DELETE_STATUS)

        return resolve(result.data.update_user_profile.returning[0])
    }catch(err){
        console.log({err})
        return reject(err)
    }
})

const increase_count_login = (item, is_reset = false) => new Promise(async(resolve,reject)=>{
    try{
        const {user_id}=item
        let count_login = item.count_login

        const variables={
            user_id
        }
        let set_count_login=`_inc: {count_login: 1}`
        if(is_reset){
            count_login = 0
            set_count_login=`_set: {count_login: $count_login}`
            variables.count_login = count_login
        }

        const UPDATE_USER=`mutation MyMutation($user_id: uuid!, $count_login: Int) {
            update_user_profile(
                where: {
                    id: {_eq: $user_id}
                }, 
                ${set_count_login}
            ) {
              returning {
                id
                username
                email
                name
                national_id
                front_url_national_id
                back_url_national_id
                count_login
              }
            }
          }
          `
        const result = await handler_hasura(variables,UPDATE_USER)
        
        return resolve(result.data.update_user_profile.returning[0])
    }catch(err){
        console.log({err})
        return reject(err)
    }
})

module.exports = {
    on_board,
    create_user_profile,
    get_user_profile,
    check_user_profile_valid,
    update_national_card,
    update_user_deleted,
    increase_count_login
}