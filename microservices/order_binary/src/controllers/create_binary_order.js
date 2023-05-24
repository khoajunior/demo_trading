const create_order = require('../services/create_order')
const get_current_price = require('../helpers/get_current_price')
const { PRICE_OBJECT } = require('../../constants/constants')
const check_validate_tournament = require('../services/check_validate_tournament')
const check_market_status = require('../helpers/check_market_status')
var ip = require("ip");
const check_count_order = require('../services/check_count_order')

//Input: tournament_id, asset, investment, type, exp_time
// because per tournament only for binary or forex if not update to redis handler margin level
module.exports = async(req, res) => {
    // console.log(`API create binary order`)
    try {
        const item = req.body.input

        //Lấy địa chỉ id của req
        item.ip = ip.address()

        const { product_type, tournament_id, investment, price_object, asset } = item
        const price_type = PRICE_OBJECT[product_type]        

        //Get current price
        const price = await get_current_price(item.asset, price_type)
        // const price = JSON.parse(price_object[asset])
        if (!price) {
            return res.status(400).json({
                code: `cannot_get_current_price`,
                message: `Tạo lệnh không thành công: không lấy được tỉ giá`
            })
        }
        item.open_price = price.mid

        const session_variables = req.body.session_variables
        const user_id = session_variables['x-hasura-user-id']
        item.user_id = user_id

        //Check user có vượt quá số lượng lệnh được đặt không
        await check_count_order({tournament_id,user_id})

        const variables = {
            tournament_id_list: [tournament_id],
            investment,
            product_type
        }

        const check_min_amount = true
        const check_max_amount = true
        const validate_tournaments = await check_validate_tournament(variables, check_min_amount, check_max_amount)
        if (validate_tournaments.length == 0) {
            return res.status(400).json({
                code: `tournament_invalid|investment_range`,
                message: `Tạo lệnh không thành công: số tiền đặt lệnh hoặc tournament không phù hợp`
            })
        }

        const market_status = await check_market_status(price_type)
        if (!market_status) {
            return res.status(400).json({
                code: `market_closed`,
                message: `Tạo lệnh không thành công: thị trường đã đóng`
            })
        }

        //Create order
        const { new_order, demo_account } = await create_order(item)

        return res.json({ status: 200, message: 'Handle success', data: new_order })
    } catch (err) {
        console.error(err)
        if (err.message) {
            err = err.message
        }
        return res.status(400).json({
            code: `handle_fail`,
            message: `Tạo lệnh không thành công: ${err}`
        })
    }
}
