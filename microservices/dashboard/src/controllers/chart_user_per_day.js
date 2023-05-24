const {count_user_per_day}=require('../services/chart/count_user_per_day')

module.exports=async(req,res)=>{
    try{
        const item = req.body.input
        const result=await count_user_per_day(item)
        
        return res.json({ status: 200, message: 'Handle success', data: result })
    }catch(err){
        return res.status(400).json({
            code: `handle_fail`,
            message: `${err}`
        })
    }
}