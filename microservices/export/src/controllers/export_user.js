const {export_user}=require('../services/user')

module.exports = async(req,res)=> {
    try{
        const item = req.body.input

        const url = await export_user(item)

        return res.json({status: 200, message: 'Handle success', data: url})
    }catch(err){
        console.log({err})
        return res.status(400).json({
            code: `handle_fail`,
            message: `${err}`
        })
    }
}