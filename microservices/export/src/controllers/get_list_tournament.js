const { get_list } = require('../services/tournament')

module.exports = async (req, res) => {
    try {
        const item = req.body.input

        const result = await get_list(item)

        return res.json({ status: 200, message: 'Handle success', data: result })
    } catch (err) {
        console.error(err)
        return res.status(400).json({
            code: `handle_fail`,
            message: `${err}`
        })
    }
}