const handler_hasura=require('../helpers/handler_hasura')

module.exports = (field,value)=> new Promise(async(resolve,reject)=>{
    try{
        let query=``
        if(field===`national_id`){
            query=`national_id: {_eq: "${value}"},`
        }
        
        if(query.length==0){
            return reject(`Nothing field to check`)
        }
        const CHECK_FIELD=`query MyQuery {
            user_profile_aggregate(where: {${query}}) {
              aggregate {
                count
              }
            }
          }
          `
        const result=await handler_hasura(null,CHECK_FIELD)

        if(result.data.user_profile_aggregate.aggregate.count > 0){
            let field_error=field
            if(field===`national_id`){
                field_error=`số chứng minh thư`
            }
            return reject(`Người dùng đã tồn tại với cùng ${field_error}`)
        }
        return resolve(true)
    }catch(err){
        console.log({err})
        return reject('Lỗi khi xử lý kiểm tra trường trùng lặp')
    }
})