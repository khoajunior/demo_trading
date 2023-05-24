const postgres = require('../../core/postgres')
const { convert_month_year } = require('../../helpers/convert_time')
const { OPTION_BINARY_TRADE } = require('../../../constants/constants')

const count_tournament_per_month = (item) => new Promise(async (resolve, reject) => {
    try {
        const start_time = item.start_time || `2000-01-01`
        const end_time = item.end_time || `3000-01-01`
        const brand_id = item.brand_id

        const variables = [
            start_time,
            end_time
        ]

        var sql = `SELECT  date_trunc('month',created_at) "time", count(*), option_trade
            FROM tournament 
            WHERE created_at >= $1 AND created_at <= $2 AND status = 1
            GROUP BY date_trunc('month',created_at), option_trade
            ORDER BY date_trunc('month',created_at) ASC;`

        if (brand_id) {
            sql = `SELECT  date_trunc('month',created_at) "time", count(*), option_trade, brand_id
            FROM tournament 
            WHERE created_at >= $1 AND created_at <= $2 AND status = 1  AND brand_id = $3
            GROUP BY date_trunc('month',created_at), option_trade, brand_id
            ORDER BY date_trunc('month',created_at) ASC;`
            variables.push(brand_id)
        }

        const { rows } = await postgres.pool.query(sql, variables)

        let list_time = []
        let list_count_binary = []
        let list_count_cfd = []
        rows.forEach(row => {
            row.time = convert_month_year(row.time)
            if (!list_time.includes(row.time)) {//nếu tháng chưa có trong mảng list_time

                list_time.push(row.time)

                if (row.option_trade === OPTION_BINARY_TRADE) {
                    list_count_binary.push(row.count)
                    list_count_cfd.push("0")
                } else {
                    list_count_cfd.push(row.count)
                    list_count_binary.push("0")
                }

            } else {//Nếu tháng đã có trong mảng list_time    

                var index = list_time.indexOf(row.time)

                if (row.option_trade === OPTION_BINARY_TRADE) {
                    list_count_binary[index] = row.count
                } else {
                    list_count_cfd[index] = row.count
                }

            }

        })

        return resolve({ list_time, list_count_binary, list_count_cfd })
    } catch (err) {
        console.error(err)
        return reject(`Lấy số lượng giải đấu theo tháng thất bại`)
    }
})

module.exports = {
    count_tournament_per_month
}

