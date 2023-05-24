const {get_list_cfd}=require('../../services/order')

module.exports = async(req,res)=> {
    try{
        const item = req.body.input

        const result = await get_list_cfd(item)

        return res.json({status: 200, message: 'Handle success', data: result})
    }catch(err){
        console.log({err})
        return res.status(400).json({
            code: `handle_fail`,
            message: `${err}`
        })
    }
}