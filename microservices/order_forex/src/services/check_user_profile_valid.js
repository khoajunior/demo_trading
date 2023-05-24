const handler_hasura = require('../helpers/handler_hasura')

const get_user_profile = (user_id) => new Promise(async (resolve, reject) => {
    try {
        const GET_USER_PROFILE = `query MyQuery($user_id: uuid) {
            user_profile(where: {id: {_eq: $user_id}}) {
                avatar
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

module.exports = (user_id) => new Promise(async(resolve,reject)=>{
    try{
        const user=await get_user_profile(user_id)

        const {front_url_national_id,back_url_national_id,role,name,national_id}=user
        if(role!=`user`){
            return resolve(user)
        }

        if(!front_url_national_id){
            return reject('Bạn chưa cập nhật mặt trước chứng minh thư')
        }
        if(!back_url_national_id){
            return reject('Bạn chưa cập nhật mặt sau chứng minh thư')
        }
        if(!name){
            return reject('Bạn chưa cập nhật họ tên')
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