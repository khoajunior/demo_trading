const {count_tournament_per_month}=require('../services/chart/count_tournament_per_month')

module.exports=async(req,res)=>{
    try{
        const item = req.body.input
        const result=await count_tournament_per_month(item)

        return res.json({ status: 200, message: 'Handle success', data: result })
    }catch(err){
        return res.status(400).json({
            code: `handle_fail`,
            message: `${err}`
        })
    }
}