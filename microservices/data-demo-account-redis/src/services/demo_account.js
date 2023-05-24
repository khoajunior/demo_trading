const postgres = require('../core/postgres')
const { STATUS_ACTIVE } = require('../../constants/constants')


const get_order = (item) => new Promise(async (resolve, reject) => {
    try {

        const sql = `
           SELECT forex.*, dc.balance, margin.total_margin 
           from demo_history_forex as forex
              left join demo_account as dc on dc.user_id = forex.user_id and dc.tournament_id = forex.tournament_id
              left join (
                  select d.user_id, d.tournament_id, sum(d.margin) as total_margin 
                  from demo_history_forex as d
                  where status = any($1)
                  group by d.user_id, d.tournament_id  
              ) as margin 
                on margin.user_id = forex.user_id and margin.tournament_id = forex.tournament_id
           where status = any($1) and forex.user_id = $2 and forex.tournament_id = $3
        `

        const variables = [
            item.status_list || [STATUS_ACTIVE],
            item.user_id,
            item.tournament_id,
        ]

        const { rows } = await postgres.pool.query(sql, variables)
        return resolve(rows)

    } catch (error) {
        console.log(error)
        return reject(error)
    }
})


const get_balance = (id_list) => new Promise(async (resolve, reject) => {
    try {

        const sql = `select * from demo_account
           where id = any($1)
        `
        const variables = [
            id_list
        ]

        const { rows } = await postgres.pool.query(sql, variables)

        // console.log({rows})
        return resolve(rows)

    } catch (error) {
        return reject(error)
    }

})


const get_demo_account = (user_id, tournament_id) => new Promise(async (resolve, reject) => {
    try {
        const sql = `select dc.*, u.username, u.email, 
                u.role, u.name, u.avatar, u.brand_id, u.phone_number,
                u.national_id, u.front_url_national_id, u.back_url_national_id, u.birthday, u.gender  
            from demo_account as dc 
            left join user_profile as u on u.id = dc.user_id  
            where user_id = $1 and tournament_id = $2
        `
        const variables = [
            user_id,
            tournament_id
        ]

        const { rows } = await postgres.pool.query(sql, variables)

        // console.log({rows})
        return resolve(rows[0])

    } catch (error) {
        return reject(error)
    }

})

module.exports = {
    get_order,
    get_balance,
    get_demo_account
}