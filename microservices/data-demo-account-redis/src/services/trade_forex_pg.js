const postgres = require('../core/postgres')
const { STATUS_CLOSE, STATUS_ACTIVE, STATUS_PENDING, STATUS_CANCEL, TOURNAMENT_DELETE_STATUS } = require('../../constants/constants')


const stop_order = (item) => new Promise(async (resolve, reject) => {
    try {
        const { tournament_id, close_price, type, asset } = item

        // return old data before updated
        var sql = `    
                with updated as (update demo_history_forex  
                    set close_price = $1,  end_time = $3, updated_at = $3, status = $5, net_profit_loss = fn_net_profit_loss * ($1 - open_price) 
                    where tournament_id = $4 and status = $6 and type = $2 and asset = $7
                  returning *
                ), updated_demo as (
                    UPDATE demo_account 
                    set balance = 
                        CASE 
                            WHEN balance + sum_net_pl < 0 THEN 0
                            ELSE balance + sum_net_pl
                        END, 
                        updated_at = $3
                    from (
                            select updated.user_id, updated.tournament_id, sum(net_profit_loss) as sum_net_pl 
                            from updated 
                            group by user_id, tournament_id
                        ) as sub
                    
                    where demo_account.user_id = sub.user_id and demo_account.tournament_id = sub.tournament_id
                    returning demo_account.*
                )
                select * from updated 
                 
        `

        // select t.*, updated.id as demo_account_id 
        // from demo_history_forex as t 
        //   inner join updated on t.tournament_id = updated.tournament_id 


        const updated_at = new Date().toISOString()
        const variables = [
            close_price, type, updated_at, tournament_id, STATUS_CLOSE, STATUS_ACTIVE, asset
        ]

        const { rows } = await postgres.pool.query(sql, variables)
        return resolve(rows)
    } catch (error) {
        console.log(error)
        return reject(error)
    }
})


const stop_order_pending_in_tournament_expired_or_deleted = (tournament_id) => new Promise(async (resolve, reject) => {
    try {

        const updated_at = new Date().toDateString()

        const sql = `
            update demo_history_forex as dhf 
              set status = $1, updated_at = $2
            FROM tournament as tour
            where (tour.end_time <= $2 or tour.status = $4) and dhf.tournament_id  = tour.id and dhf.status = $3 and tour.id = $5
            returning *
        `

        const variables = [
            STATUS_CANCEL, updated_at, STATUS_PENDING, TOURNAMENT_DELETE_STATUS, tournament_id
        ]

        const { rows } = await postgres.pool.query(sql, variables)
        // console.log({pending_order: rows})

        return resolve(rows)

    } catch (error) {
        console.log(error)
        return reject(error)
    }
})


const get_order_list = (count_id_list, status = STATUS_ACTIVE) => new Promise(async (resolve, reject) => {
    try {

        const variables = [
            count_id_list,
            status
        ]

        const sql = `select * from demo_history_forex where count_id = any($1) and status = $2`

        const { rows } = await postgres.pool.query(sql, variables)
        return resolve(rows)
    } catch (error) {
        console.log(error)
        return reject(error)
    }
})


module.exports = {
    stop_order,
    stop_order_pending_in_tournament_expired_or_deleted,
    get_order_list
}