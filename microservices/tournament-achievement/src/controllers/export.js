const get_list_tournament = require('../services/get_list_tournament')
const get_list_order_in_tournament = require('../services/get_list_order_in_tournament')
const get_list_order_by_user = require('../services/get_list_order_by_user')
const {get_history_username}=require('../services/history_username')
const { check_user_in_tournament } = require('../services/tournament')
const get_tournament_by_id = require('../services/get_tournament_by_id')
const { sort_by_equity, sort_by_balance } = require('../services/sort_rank_user')
const { get_user_profile } = require('../helpers/get_user_profiles_hasura')
const upload_s3 = require('../helpers/upload_s3')
const { TYPE_TRADE_NAME, PRODUCT_TRADE_NAME, OPTION_FOREX_TRADE } = require('../../constants/constants')
const convert_time = require('../helpers/convert_time')
const xlsx = require('node-xlsx')
const handler_hasura = require('../helpers/handler_hasura')

const export_tournament = async(req, res) => {
    try {
        const item = req.body.input
            // const item = req.body

        //filter danh sách tournament
        const { tournament_list } = await get_list_tournament(item)

        //Tạo Buffer để export
        const data_export = tournament_list.map(record => {

            //format lại start_time và end_time
            const start_time = convert_time(record.start_time)
            const end_time = convert_time(record.end_time)

            //Câu mô tả hình thức thi
            let sentence_rule = ``
            let sentence_leverage = ``
            if (record.reward_rule_tournaments.length > 0) {
                sentence_rule = `tiêu chí xếp hạng: `
                record.reward_rule_tournaments.forEach(item => {
                    sentence_rule += `${item.reward_rule.name}, `
                })
            }
            if (record.leverage_tournaments.length > 0 && record.option_trade == 2) {
                sentence_leverage = `đòn bẩy: `
                record.leverage_tournaments.forEach(item => {
                    sentence_leverage += `1:${item.leverage.leverage}, `
                })
            }
            //In những thông tin: min_amount,default_balance,đòn bẩy
            const format = `Số dư mặc định: ${record.default_balance}, khối lượng lệnh nhỏ nhất: ${record.min_amount}, ${sentence_rule} ${sentence_leverage}`

            const data = {
                name: record.name,
                type_trade: TYPE_TRADE_NAME[record.option_trade], // Loại hình giao dịch
                product_trade: PRODUCT_TRADE_NAME[record.product_type], // Nhóm sản phẩm giao dịch
                format, //Hình thức thi
                start_time,
                end_time,
                organizer: record.organizer, // Ban tổ chức
                sponsor: ``, //Đơn vị tài trợ
                total_reward: record.total_reward, // Tổng giá trị giải thưởng
                count_user: record.demo_accounts_aggregate.aggregate.count // Số lượng người tham gia
            }
            return Object.values(data)
        })
        const format_data = [
            [`Tên cuộc thi`, `Loại hình giao dịch`, `Nhóm sản phẩm`, `Hình thức thi`, `Ngày bắt đầu`, `Ngày kết thúc`, `Ban tổ chức`, `Đơn vị tài trợ`, `Tổng giá trị giải thưởng`, `Số lượng người tham gia`],
            ...data_export
        ]

        var wscols = [{ wpx: 1000 }];
        const options = {
            '!cols': [
                { wch: 20 },
                { wch: 17 },
                { wch: 17 },
                { wch: 40 },
                { wch: 20 },
                { wch: 20 },
                { wch: 15 },
                { wch: 20 },
                { wch: 20 },
                { wch: 20 },
                wscols,
            ],
        };

        var buffer = xlsx.build([{ data: format_data }], options); // Returns a buffer

        //Upload lên s3
        const url = await upload_s3({ data: buffer }, `tournament`)
        return res.json({ status: 200, message: 'Handle success', data: url })
    } catch (err) {
        console.error(err)
        return res.status(400).json({
            code: `handle_fail`,
            message: `${err}`
        })
    }
}

const export_order_in_tournament = async(req, res) => {
    try {
        const item = req.body.input
        // const item = req.body
        const { user_id, tournament_id } = item
        let user_profile
        let username = `tất cả người chơi`
        if (item.user_id) {
            user_profile = await get_user_profile(user_id)
            username = user_profile.username

            //Kiểm tra user có tham gia tournament không
            await check_user_in_tournament(item)
        }

        //filter danh sách tournament
        const { order_list, tournament } = await get_list_order_in_tournament(item)
        let current_time = new Date().toISOString()
        current_time = convert_time(current_time)

        //Tạo Buffer để export
        // let STT=1
        const data_export = order_list.map(record => {
            const created_at = convert_time(record.created_at)
            // const start_time=convert_time(record.start_time)
            const end_time = convert_time(record.end_time)
            let type=`BUY`
            if(record.type===2){
                type=`SELL`
            }
            const data = {
                // STT: STT++,
                username: record.user.username,
                email: record.user.email,
                asset: record.asset,
                created_at,
                // start_time,
                end_time,
                quantity: record.quantity || record.investment,
                type,
                open_price:record.open_price,
                close_price:record.close_price,
                // pending_price: record.pending_price||`Không có`,
                net_pl: record.total_profit_loss || 0,
                // IP: record.IP,
                // start_time_timestamptz: record.start_time,
                // end_time_timestamptz: record.end_time                
            }
            return Object.values(data)
        })

        let name_invesment=`Số tiền`
        if(tournament.option_trade===OPTION_FOREX_TRADE){
            name_invesment=`Số lot`
        }
        const format_data = [
            [`Tên report`, `Ngày xuất file`, `Tên cuộc thi`, `Loại hình giao dịch`, `Nhóm sản phẩm`],
            [`Lịch sử đặt lệnh của ${username} trong giải đấu ${tournament.name}`, current_time, `${tournament.name}`, `${TYPE_TRADE_NAME[tournament.option_trade]}`, `${PRODUCT_TRADE_NAME[tournament.product_type]}`],
            [],
            [],
            [`Username`, `Email`, `Sản phẩm`, `Thời gian đặt lệnh`, `Thời gian chốt lệnh`, `${name_invesment}`,`Loại lệnh`,`Giá mở cửa`,`Giá đóng cửa`,`Lợi nhuận/Thua lỗ`],//`IP` thêm lại sau
            ...data_export
        ]

        var wscols = [{ wpx: 1000 }];
        const options = {
            '!cols': [
                { wch: 35 },
                { wch: 40 },
                { wch: 17 },
                { wch: 20 },
                { wch: 20 },
                { wch: 20 },
                { wch: 20 },
                { wch: 20 },
                { wch: 20 },
                { wch: 20 },
                wscols,
            ],
        };

        var buffer = xlsx.build([{ data: format_data }], options); // Returns a buffer

        //Upload lên s3
        const url = await upload_s3({ data: buffer }, `tournament`)
        return res.json({ status: 200, message: 'Handle success', data: url })
    } catch (err) {
        console.error(err)
        return res.status(400).json({
            code: `handle_fail`,
            message: `${err}`
        })
    }
}

const export_user_in_tournament = async(req, res) => {
    try {

        const item = req.body.input
            // const item = req.body

        //Lấy thông tin của tournament
        let current_time = new Date().toISOString()
        current_time = convert_time(current_time)
        const response_tournament = await get_tournament_by_id(item.tournament_id)
        tournament=response_tournament[0]

        //Lấy danh sách user theo rank
        let list_user
        let response_sort
        if(tournament.end_time>=current_time){
            response_sort = await sort_by_equity(item)
            list_user=response_sort.list_user
        }else{
            response_sort=await sort_by_balance(item)
            list_user=response_sort.list_user
        }

        //Tạo Buffer để export
        var rank = 1
        const data_export = list_user.map(record => {
            const data = {
                fullname: record.name,
                username: record.username,
                email: record.email,
                // phone_number: record.phone_number || ``,
                national_id: record.national_id,
                equity: record.equity || record.balance, //Nếu giải đấu binary -> không có equity -> sắp xếp theo balance
                rank
            }
            rank += 1
            return Object.values(data)
        })
        const format_data = [
            [`Tên report`, `Ngày xuất file`],
            [`Danh sách người tham gia giải đấu ${tournament.name}`, current_time],
            [],
            [],
            [`Họ tên`, `Tên hiển thị`, `Email`, `Số chứng minh thư`, `Equity`, `Thứ hạng`,`Note`],
            ...data_export
        ]

        var wscols = [{ wpx: 1000 }];
        const options = {
            '!cols': [
                { wch: 40 },
                { wch: 20 },
                { wch: 35 },
                { wch: 17 },
                { wch: 15 },
                { wch: 10 },
                { wch: 40 },
                wscols,
            ],
        };

        var buffer = xlsx.build([{ data: format_data }], options); // Returns a buffer

        //Upload lên s3
        const url = await upload_s3({ data: buffer }, `tournament`)
        return res.json({ status: 200, message: 'Handle success', data: url })
    } catch (err) {
        console.error(err)
        return res.status(400).json({
            code: `handle_fail`,
            message: `${err}`
        })
    }
}

const export_order_by_user = async(req, res) => {
    try {
        const item = req.body.input
        // const item = req.body
        const { user_id } = item
        const { username } = await get_user_profile(user_id)
        let current_time = new Date().toISOString()
        current_time = convert_time(current_time)

        //filter danh sách tournament
        const { order_list } = await get_list_order_by_user(item)

        //Tạo Buffer để export
        const data_export = order_list.map(record => {
            const { tournament_name, type_trade, product_trade, asset, total_profit_loss, IP, open_price, close_price } = record
            const created_at = convert_time(record.created_at)
            const end_time = convert_time(record.end_time)
            const data = {
                tournament_name,
                type_trade: TYPE_TRADE_NAME[type_trade],
                asset,
                created_at,
                open_price,
                end_time,
                close_price: close_price || `Lệnh bị hủy`,
                total_profit_loss: total_profit_loss || 0,
                IP
            }
            return Object.values(data)
        })
        const format_data = [
            [`Tên report`, `Ngày xuất file`],
            [`Lịch sử đặt lệnh của ${username}`, current_time],
            [],
            [],
            [`Tên cuộc thi`, `Loại hình giao dịch`, `Sản phẩm`, `Thời gian đặt lệnh`, `Giá mở cửa`, `Thời gian chốt lệnh`, `Giá chốt lệnh`, `Lợi nhuận/thua lỗ`, `IP`],
            ...data_export
        ]

        var wscols = [{ wpx: 1000 }];
        const options = {
            '!cols': [
                { wch: 27 },
                { wch: 17 },
                { wch: 13 },
                { wch: 17 },
                { wch: 13 },
                { wch: 17 },
                { wch: 13 },
                { wch: 17 },
                { wch: 15 },
                wscols,
            ],
        };

        var buffer = xlsx.build([{ data: format_data }], options); // Returns a buffer

        //Upload lên s3
        const url = await upload_s3({ data: buffer }, `tournament`)
        return res.json({ status: 200, message: 'Handle success', data: url })
    } catch (err) {
        console.error(err)
        return res.status(400).json({
            code: `handle_fail`,
            message: `${err}`
        })
    }
}

const export_history_username = async(req, res) => {
    try {
        // const item = req.body.input
        const item = req.body

        const history=await get_history_username(item)//item gồm tournament_id,rank

        //Tạo Buffer để export
        const data_export = history.map(record => {
            const { old_username,created_at,user_profile } = record
            const created_at_convert = convert_time(created_at)
            const data = {
                name: user_profile.name,
                email: user_profile.email,
                national_id: user_profile.national_id,
                username: old_username,
                created_at_convert,
                equity: user_profile.demo_accounts[0].balance,
                rank: user_profile.demo_accounts[0].rank,
            }
            return Object.values(data)
        })
        const format_data = [
            [`Họ tên`, `Email`, `Số chứng minh thư`, `Tên hiển thị cũ`,`Thời điểm thay đổi`, `Số dư`,`Thứ hạng`],
            ...data_export
        ]

        var wscols = [{ wpx: 1000 }];
        const options = {
            '!cols': [
                { wch: 25 },
                { wch: 35 },
                { wch: 17 },
                { wch: 20 },
                { wch: 20 },
                { wch: 15 },
                { wch: 10 },
                wscols,
            ],
        };

        var buffer = xlsx.build([{ data: format_data }], options); // Returns a buffer

        //Upload lên s3
        const url = await upload_s3({ data: buffer }, `history_username`)
        return res.json({ status: 200, message: 'Handle success', data: url })
    } catch (err) {
        console.error(err)
        return res.status(400).json({
            code: `handle_fail`,
            message: `${err}`
        })
    }
}

const export_list_user = async(req, res) => {
    try {
        // const item = req.body.input
        const item = req.body

        const GET_USER=`query MyQuery {
            user_profile_aggregate(where: {created_at: {_gte: "2021-11-16"}}, order_by: {created_at: asc}) {
              aggregate {
                count
              }
              nodes {
                id
                name
                username
                email
                phone_number
                national_id
                created_at
              }
            }
          }`
        const response = await handler_hasura(null,GET_USER)
        const user_list = response.data.user_profile_aggregate.nodes

        //Tạo Buffer để export
        const data_export = user_list.map(record => {
            const { name,username,email,phone_number,national_id,created_at } = record
            const created_at_convert = convert_time(created_at)
            const data = {
                name,email,username,national_id,phone_number,created_at_convert
            }
            return Object.values(data)
        })
        const format_data = [
            [`Họ tên`, `Email`, `Tên hiển thị`,`Số chứng minh thư`, `Số điện thoại`, `Ngày tạo`],
            ...data_export
        ]

        var wscols = [{ wpx: 1000 }];
        const options = {
            '!cols': [
                { wch: 25 },
                { wch: 40 },
                { wch: 20 },
                { wch: 20 },
                { wch: 20 },
                { wch: 30 },
                wscols,
            ],
        };

        var buffer = xlsx.build([{ data: format_data }], options); // Returns a buffer

        //Upload lên s3
        const url = await upload_s3({ data: buffer }, `user`)
        return res.json({ status: 200, message: 'Handle success', data: url })
    } catch (err) {
        console.error(err)
        return res.status(400).json({
            code: `handle_fail`,
            message: `${err}`
        })
    }
}

module.exports = {
    export_tournament,
    export_order_in_tournament,
    export_user_in_tournament,
    export_order_by_user,
    export_history_username,
    export_list_user
}