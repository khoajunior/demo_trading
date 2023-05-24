const handle_hasura = require('../helpers/handler_hasura')
const {redis_db} = require('../core/redis_db')
const {USER_PROFILE} = require('../../constants/constants')

module.exports = () => new Promise(async (resolve, reject) => {
  try{
    const GET_USER = `query MyQuery {
      user_profile_aggregate(where: {}) {
        aggregate {
          count
        }
        nodes {
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
        }
      }
    }
    `

    const result = await handle_hasura(null, GET_USER)

    const {nodes: user_list, aggregate} = result.data.user_profile_aggregate
    console.log(user_list, aggregate)

    for(var i = 0; i < user_list.length; i ++){
      const user = user_list[i]
      const user_id = user.id
      console.log({user, user_id})
      await redis_db.hmsetAsync(USER_PROFILE, user_id, JSON.stringify(user))

    }
    console.log("finish")
    return resolve(true)

  }catch(error){
    console.log(error)
    return reject(error)
  }
})