const {export_tournament}=require('../services/tournament')

module.exports = async(req,res)=> {
    try{
        const item = req.body.input

        const url = await export_tournament(item)

        return res.json({status: 200, message: 'Handle success', data: url})
    }catch(err){
        console.log({err})
        return res.status(400).json({
            code: `handle_fail`,
            message: `${err}`
        })
    }
}