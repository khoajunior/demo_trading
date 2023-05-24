const {handle_machine_session_login}=require('../services/handle_session_login')

//user_id, machine_id, session
module.exports=async(req,res)=>{
    try{
        const item=req.body.input
        const session_variables = req.body.session_variables
        const user_id = session_variables['x-hasura-user-id']
        item.user_id=user_id
        
        const result=await handle_machine_session_login(item)

        return res.json({ status: 200, message: 'Handle success', data: result })
    }catch(err){
        return res.status(400).json({
            code: "handle_fail",
            message: `${err}`,
        })
    }
}