const postgres = require('../../core/postgres')
const { convert_month_day_year } = require('../../helpers/convert_time')

const count_user_per_day = (item) => new Promise(async (resolve, reject) => {
    try {
        const start_time = item.start_time || `2000-01-01`
        const end_time = item.end_time || `3000-01-01`
        const brand_id = item.brand_id

        const variables = [
            start_time,
            end_time
        ]

        var sql = `SELECT  date_trunc('day',created_at) "day", count(*)
            FROM user_profile  
            WHERE created_at >= $1 AND created_at <= $2
            GROUP BY date_trunc('day',created_at)
            ORDER BY date_trunc('day',created_at) ASC;`

        if (brand_id) {

            sql = `SELECT  date_trunc('day',dc.created_at) "day", count(dc.*) 
            FROM demo_account as dc
              INNER JOIN tournament as t ON t.id = dc.tournament_id AND t.brand_id = $3 
            WHERE dc.created_at >= $1 AND dc.created_at <= $2 
            GROUP BY date_trunc('day', dc.created_at)
            ORDER BY date_trunc('day', dc.created_at) ASC;`
            variables.push(brand_id)
        }
        const { rows } = await postgres.pool.query(sql, variables)

        let list_day = []
        let list_count = []
        rows.forEach(row => {
            list_day.push(convert_month_day_year(row.day))
            list_count.push(row.count)
        })
        return resolve({ list_day, list_count })
    } catch (err) {
        console.error(err)
        return reject(`Lấy số lượng người đăng ký theo ngày thất bại`)
    }
})

module.exports = {
    count_user_per_day
}