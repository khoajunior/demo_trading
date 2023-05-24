const { get_achivement } = require('../services/achievements')
const ACTION = `Lấy giải thưởng không thành công`

//req: tournament_id(list)
module.exports = async(req, res) => {
    try {
        const session_variables = req.body.session_variables
        const user_id = session_variables['x-hasura-user-id']
            // const user_id = `10c587ba-e4e9-42a3-a0d3-a73c71453f4b`

        const item = req.body.input
            // const item = req.body

        item.user_id = user_id
        const result = await get_achivement(item)

        return res.json({ status: 200, message: 'Handle success', data: result })
    } catch (err) {
        return res.status(400).json({
            code: `handle_fail`,
            message: `${ACTION}: ${err}`
        })
    }
}