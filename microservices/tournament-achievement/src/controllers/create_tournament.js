const { create_tournament } = require('../services/tournament')
const ACTION = `Tạo giải đấu không thành công`

module.exports = async(req, res) => {

    try {
        const session_variables = req.body.session_variables
        const user_id = session_variables['x-hasura-user-id']
        const user_role = session_variables['x-hasura-role']
        // const user_id = `10c587ba-e4e9-42a3-a0d3-a73c71453f4b`

        const item = req.body.input
            // const item = req.body

        item.user_id = user_id
        item.user_role = user_role
        const result = await create_tournament(item)

        return res.json({ status: 200, message: 'Handle success', data: result })
    } catch (err) {
        console.error(err)
        return res.status(400).json({
            code: `handle_fail`,
            message: `${err}`
        })
    }
}