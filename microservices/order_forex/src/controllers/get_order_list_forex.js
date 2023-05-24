const get_list = require('../services/get_list')
const check_validate_tournament = require('../services/check_validate_tournament')
const ACTION = `Lấy danh sách lệnh không thành công`

//Input: user_id,tournament_id,start_day,end_day,sort_by,sort_direction,page_size,current_page,status
module.exports = async(req, res) => {
    try {
        const session_variables = req.body.session_variables
        const user_id = session_variables['x-hasura-user-id']
        const item = req.body.input

        item.user_list = user_id
        item.tournament_list = item.tournament_id

        //check validate tournament
        const variables = {
            tournament_id_list: item.tournament_id
        }
        const validate_tournaments = await check_validate_tournament(variables)
        if (validate_tournaments.length == 0) {
            return res.status(400).json({
                code: `tournament_invalid`,
                message: `${ACTION}: tournament không phù hợp`
            })
        }

        const order_list = await get_list(item)

        return res.json({ status: 200, message: 'Handle success', data: order_list })
    } catch (err) {
        console.error(err)
        if (err.message) {
            err = err.message
        }
        return res.status(400).json({
            code: `handle_fail`,
            message: `${ACTION}: ${err}`
        })
    }
}