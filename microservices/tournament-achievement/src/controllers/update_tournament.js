const update_tournament_custom = require('../services/update_tournament_custom')
const { get_user_profile } = require('../helpers/get_user_profiles_hasura')

module.exports = async(req, res) => {
    try {
        const session_variables = req.body.session_variables
        const user_id = session_variables['x-hasura-user-id']
        const user_role = session_variables['x-hasura-role']
        const { brand_id } = await get_user_profile(user_id)

        const item = {
            ...req.body.input,
            user_id,
            brand_id,
            user_role
        }
        const result = await update_tournament_custom(item)

        return res.json({ status: 200, message: 'Handle success', data: result })
    } catch (err) {
        console.error(err)
        return res.status(400).json({
            code: `handle_fail`,
            message: `${err}`
        })
    }
}