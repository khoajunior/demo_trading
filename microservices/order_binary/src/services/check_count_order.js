const handle_hasura = require('../helpers/handler_hasura')

module.exports=(item)=>new Promise(async(resolve,reject)=>{
    try{
        const {user_id,tournament_id}=item

        const GET_COUNT=`query MyQuery($user_id: uuid!,$tournament_id:uuid!) {
          demo_history_binary_aggregate(where: {tournament_id: {_eq: $tournament_id}, user_id: {_eq: $user_id}, is_checked: {_eq: false}}) {
            aggregate {
              count
            }
          }
        }
          `
        const variables={
            user_id,tournament_id
        }

        const response = await handle_hasura(variables,GET_COUNT)

        const count = response.data.demo_history_binary_aggregate.aggregate.count

        if(count>100){
            return reject(`Số lượng lệnh bạn đặt vượt quá hạn mức cho phép`)
        }
        return resolve(true)
    }catch(err){
        console.log({err})
        return reject(err)
    }
})
