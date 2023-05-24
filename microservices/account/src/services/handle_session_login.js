const handle_hasura=require('../helpers/handler_hasura')
const { logout_user } = require('./keycloak')
const { get_session_user } =require('./keycloak')

const handle_machine_session_login=(item)=>new Promise(async(resolve,reject)=>{
    try{
        const {machine_id,user_id,session}=item

        let result_insert_machine_user
        let result_insert_session

        //check machine có account nào khác đang login
        const existed_login=await get_machine_user({machine_id})
        if(!existed_login){//Trường hợp không có user nào đang login trên thiết bị này
            result_insert_machine_user = await insert_machine_user({ machine_id, user_id })
            result_insert_session = await insert_session({
                session,
                machine_user_id: result_insert_machine_user.id
            })

            return resolve(result_insert_session)
        }else{
            if(existed_login.user_profile.id===user_id){//Trường hợp user tạo session đang login trên thiết bị
                result_insert_session = await insert_session({
                    session,
                    machine_user_id: existed_login.id
                })
                return resolve(result_insert_session)
            }else{//Trường hợp có user khác đang login trên thiết bị
                //Xóa các thông tin session cũ trong hasura
                await delete_machine_user(existed_login.id)

                //Logout những session cũ trên keycloak
                for(var i=0;i<existed_login.sessions.length;i++){
                    try{
                        await logout_user({session_state: existed_login.sessions[i].session})
                    }catch(err){
                        console.log(`Error when logout session ${existed_login.sessions[i].session} in keycloak: `,err)
                    }
                }

                //Ghi thông tin login của user mới vào hasura
                result_insert_machine_user = await insert_machine_user({ machine_id, user_id })
                result_insert_session = await insert_session({
                    session,
                    machine_user_id: result_insert_machine_user.id
                })
                return resolve(result_insert_session)
            }
        }

    }catch(err){
        console.log({err})
        return reject(err)
    }
})

const handle_session_expire=()=>new Promise(async(resolve,reject)=>{
    try{
        //Lấy những session có updated_time quá 10 ngày so với current_time
        const current_time = new Date().getTime()/1000
        let expired_time=current_time - 3600*24*10 // thời gian 10 ngày
        expired_time=new Date(expired_time*1000).toISOString()
        let session_list=[]
        const response_session=await get_session({expired_time})
        response_session.forEach(session_item=>{
            session_list.push(session_item.session)
        })

        //Xóa những session đó trong hasura
        await delete_session({session: session_list})

        //Logout những session đó trong keycloak
        try{
            for(var i=0;i<session_list.length;i++){
                await logout_user({session_state: session_list[i]})
            }
        }catch(err){
            console.log({err})
        }
        return resolve(true)
    }catch(err){
        console.log({err})
        return reject(err)
    }
})

const get_machine_user=(item)=>new Promise(async(resolve,reject)=>{
    try{
        const { machine_id }=item
        const GET_MACHINE_USER=`query MyQuery($machine_id: String) {
            machine_user(where: {machine_id: {_eq: $machine_id}}) {
              id
              machine_id
              sessions {
                id
                session
              }
              user_profile {
                id
                email
              }
            }
          }`
        const response = await handle_hasura({machine_id},GET_MACHINE_USER)

        return resolve(response.data.machine_user[0])
    }catch(err){
        console.log({err})
        return reject(err)
    }
})

const get_session=(item)=>new Promise(async(resolve,reject)=>{
    try{
        const expired_time=item.expire_time||'3000-01-01'

        const GET_SESSION=`query MyQuery ($expired_time:timestamptz!){
            session(where: {updated_at: {_lte: $expired_time}}) {
              id
              machine_user {
                id
                machine_id
                user_profile {
                  id
                  email
                  username
                }
                created_at
              }
              session
              updated_at
            }
          }`

        const response=await handle_hasura({expired_time},GET_SESSION)

        return resolve(response.data.session)
    }catch(err){
        console.log({err})
        return(err)
    }
})

//machine_id,user_id
const insert_machine_user=(item)=>new Promise(async(resolve,reject)=>{
    try{
        const {machine_id,user_id}=item

        const INSERT_MACHINE_USER=`mutation MyMutation($machine_id: String!,$user_id:uuid!,$created_at: timestamptz) {
            insert_machine_user(objects: {machine_id: $machine_id, user_id: $user_id, created_at: $created_at}) {
              returning {
                id
                machine_id
                user_profile {
                  id
                  email
                }
                sessions {
                  id
                  session
                }
              }
            }
          }`
        
        const variables={
            machine_id,
            user_id,
            created_at: new Date().toISOString()
        }
        const response=await handle_hasura(variables,INSERT_MACHINE_USER)

        return resolve(response.data.insert_machine_user.returning[0])
    }catch(err){
        console.log({err})
        return reject(err)
    }
})

//session,machine_user_id
const insert_session=(item)=>new Promise(async(resolve,reject)=>{
    try{
        const {session,machine_user_id}=item

        const INSERT_SESSION=`mutation MyMutation($session: String!, $machine_user_id: uuid!, $created_at: timestamptz) {
            insert_session(objects: {session: $session, machine_user_id: $machine_user_id, created_at: $created_at}) {
              returning {
                id
                session
                machine_user {
                  id
                  machine_id
                  user_id
                  user_profile {
                    id
                    name
                    username
                    email
                  }
                }
              }
            }
          }`
        
        const variables={
            session,
            machine_user_id,
            created_at: new Date().toISOString()
        }
        const response=await handle_hasura(variables,INSERT_SESSION)

        return resolve(response.data.insert_session.returning[0])
    }catch(err){
        console.log({err})
        return reject(err)
    }
})

const delete_machine_user=(machine_user_id)=>new Promise(async(resolve,reject)=>{
    try{
        const DELETE_MACHINE_USER=`mutation MyMutation($machine_user_id: uuid!) {
            delete_session(where: {machine_user: {id: {_eq: $machine_user_id}}}) {
                returning {
                  id
                  session
                }
            }
            delete_machine_user(where: {id: {_eq: $machine_user_id}}) {
                returning {
                  id
                  machine_id
                  user_id
                }
            }
        }`

        const response=await handle_hasura({machine_user_id},DELETE_MACHINE_USER)

        return resolve(response.data)
    }catch(err){
        console.log({err})
        return reject(err)
    }
})

const delete_session=(item)=>new Promise(async(resolve,reject)=>{
    try{
        const{session}=item
        const DELETE_SESSION=`mutation MyMutation($session:[String!]) {
            delete_session(where: {session: {_in: $session}}) {
              returning {
                id
              }
            }
          }`

        const response=await handle_hasura({session},DELETE_SESSION)

        return resolve(response.data)
    }catch(err){
        console.log({err})
        return reject(err)
    }
})

//Xử lý k cho user đăng nhập nhiều session khác nhau
const delete_old_session = (item) => new Promise(async (resolve, reject) => {
    try {
        const {user_id,new_session}=item

        let session_list = await get_session_user({user_id})
        let session_input=[]
        session_list.forEach(session=>{
            if(session.id != new_session){
                session_input.push(session)
            }
        })
        await logout_user({session_state: session_input})

        return resolve(true)
    } catch (err) {
      return reject(err);
    }
});

module.exports={
    handle_machine_session_login,
    handle_session_expire,
    delete_old_session
}