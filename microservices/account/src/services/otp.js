const fetch = require('node-fetch')
const { AUTHEN_KEY_OTP, TIME_EXPIRE } = require('../../constants/constants')
const handler_hasura = require('../helpers/handler_hasura')
const { check_random_code } = require('../helpers/random_code')
const { update_user } = require('../services/hasura')

const send_otp_voice = (item) => new Promise(async (resolve, reject) => {
  try {
    const { code_number, phone } = item

    const input_body = {
      from: "WFOTP",
      to: phone,
      text: code_number
    }
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${AUTHEN_KEY_OTP}`,
      },
      body: JSON.stringify(input_body)
    };

    const url_api = `https://api-02.worldsms.vn/webapi/sendVoiceOTP`
    let response = await fetch(url_api, options);
    response = await response.json();

    if (response.errorcode) {
      return reject(response.description)
    }

    return resolve(response)
  } catch (err) {
    console.error(err)
    return reject(err)
  }
})

const update_phone_in_user_profile = (item) => new Promise(async (resolve, reject) => {
  try {
    const { user_id, phone_number, email } = item
    const variables = { phone_number }

    var query = ``
    if (user_id) {
      query = `id: {_eq: $user_id}, `
      variables.user_id = user_id
    }

    if (email) {
      query = `email: {_eq: $email}, `
      variables.email = email
    }

    const UPDATE_PHONE = `mutation MyMutation($user_id: uuid, $email: String, $phone_number: String) {
      update_user_profile(where: {
        ${query}
        is_verified_otp: {_eq: false}}, _set: {phone_number: $phone_number}) {
        returning {
          id
          email
          username
          phone_number
          is_verified_otp
        }
      }
    }
    `
    const result = await handler_hasura(variables, UPDATE_PHONE)
    // console.log({result})

    return resolve(result.data.update_user_profile.returning[0])
  } catch (err) {
    console.error(err)
    return reject(err)
  }
})

const get_user_by_phone_and_otp = (item) => new Promise(async (resolve, reject) => {
  try {
    const { phone_number } = item

    const GET_USER = `query MyQuery($phone_number: String) {
      user_profile(where: {phone_number: {_eq: $phone_number}, is_verified_otp: {_eq: true}}) {
        id
        username
        email
        name
        phone_number
        is_verified_otp
      }
    }`

    let response = await handler_hasura({ phone_number }, GET_USER)

    return resolve(response.data.user_profile)
  } catch (err) {
    console.error(err)
    return reject(err)
  }
})

const get_phone_otp = (phone_number) => new Promise(async (resolve, reject) => {
  try {
    const GET_PHONE_CODE = `query MyQuery($phone_number: String) {
          phone_otp(where: {phone_number: {_eq: $phone_number}}) {
            code
            created_at
            exp_time
            id
            phone_number
            updated_at
          }
        }`

    const variables = {
      phone_number
    }
    const result = await handler_hasura(variables, GET_PHONE_CODE)

    return resolve(result.data.phone_otp[0])

  } catch (error) {
    console.log(error)
    return reject(error)
  }
})

const create_phone_otp = (item) => new Promise(async (resolve, reject) => {
  try {
    const CREATE_PHONE_CODE = `
          mutation MyMutation ($code: String, $exp_time: timestamptz, $phone_number: String){
          insert_phone_otp(objects: {code: $code, exp_time: $exp_time, phone_number: $phone_number}) {
              returning {
              updated_at
              phone_number
              id
              exp_time
              created_at
              code
              }
          }
      }`

    const exp_time = new Date(new Date().getTime() + TIME_EXPIRE * 1000).toISOString()

    const variables = {
      phone_number: item.phone_number,
      code: item.code_hash,
      exp_time
    }

    const result = await handler_hasura(variables, CREATE_PHONE_CODE)

    const phone_code = result.data.insert_phone_otp[0]
    return resolve(phone_code)
  } catch (error) {
    console.log(error)
    return reject(error)
  }
})

const update_phone_otp = (item) => new Promise(async (resolve, reject) => {
  try {
    const UPDATE_PHONE_CODE = `mutation MyMutation($code: String, $exp_time: timestamptz, $phone_number: String, $current_time: timestamptz) {
          update_phone_otp(where: {phone_number: {_eq: $phone_number}}, _set: {code: $code, exp_time: $exp_time, updated_at: $current_time}) {
            returning {
              code
              created_at
              exp_time
              id
              phone_number
              updated_at
            }
          }
        }
        `

    const exp_time = new Date(new Date().getTime() + TIME_EXPIRE * 1000).toISOString()
    const current_time = new Date().toISOString()

    const variables = {
      phone_number: item.phone_number,
      code: item.code_hash,
      current_time,
      exp_time
    }

    const result = await handler_hasura(variables, UPDATE_PHONE_CODE)
    const phone_code = result.data.update_phone_otp.returning[0]

    return resolve(phone_code)
  } catch (error) {
    console.log(error)
    return reject(error)
  }
})

const delete_code_in_phone_otp = (item) => new Promise(async (resolve, reject) => {
  try {
    const { phone_number } = item
    const DELETE_CODE = `mutation MyMutation($phone_number: String) {
        update_phone_otp(where: {phone_number: {_eq: $phone_number}}, _set: {code: null, exp_time: null}) {
          returning {
            id
            phone_number
            code
            exp_time
          }
        }
      }`

    const result = await handler_hasura({ phone_number }, DELETE_CODE)

    return resolve(result.data.update_phone_otp.returning[0])
  } catch (err) {
    return reject(err)
  }
})

const handle_verify_otp = (item) => new Promise(async (resolve, reject) => {
  try {
    const { phone_number, code, user_id } = item

    const otp = await get_phone_otp(phone_number)

    await check_random_code(code, otp.code, otp.exp_time)
    //update verified_otp trong hasura thành true
    await update_user({ user_id, is_verified_otp: true })

    //Xóa code và exp_time trong bảng phone_otp
    await delete_code_in_phone_otp({ phone_number })

    return resolve(true)
  } catch (err) {
    return reject(err)
  }
})



module.exports = {
  send_otp_voice,
  update_phone_in_user_profile,
  get_user_by_phone_and_otp,
  get_phone_otp,
  update_phone_otp,
  create_phone_otp,
  delete_code_in_phone_otp,
  handle_verify_otp
}