// const create_order = require('../services/create_order_forex')

//item: asset,request_id,quantity,leverage
module.exports = async(req, res) => {
    try {
        const item = req.body

        const result = await create_order(item)
        console.log({ result })
        return res.json({ status: 200, message: 'Handle success', data: result })
    } catch (err) {
        return res.json({ status: 400, message: err, data: null })
    }
}