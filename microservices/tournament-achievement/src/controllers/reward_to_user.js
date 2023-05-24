const add_reward_to_user = require('../services/add_reward_to_user')

//req: tournament_id
module.exports = async(req, res) => {
    try {
        const item = req.body.input
            // const item = req.body

        await add_reward_to_user(item)

        return res.json({ status: 200, message: 'Handle success', data: null })
    } catch (err) {
        return res.status(400).json({
            code: `handle_fail`,
            message: `${err}`
        })
    }
}