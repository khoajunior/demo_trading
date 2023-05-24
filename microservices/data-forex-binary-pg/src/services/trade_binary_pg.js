const postgres = require('../core/postgres')


const stop_order = item => new Promise(async (resolve, reject) => {
    try{
        const {
            close_price,
            updated_at,
            total_profit_loss,
            is_checked,
            equity,
            percent_profit_loss,
            id
        } = item

        const sql = ` 
                with updated as (update demo_history_binary 
                  set close_price = $1, updated_at = $2, total_profit_loss = $3,
                  is_checked = $4, equity = $5 , percent_profit_loss = $8
                where id  = $6 and is_checked = $7
                returning *
              )
              UPDATE demo_account
                set updated_at = $2, balance = balance + $5
              from updated 
              where demo_account.user_id = updated.user_id and demo_account.tournament_id = updated.tournament_id 
              returning demo_account.*
            `
        const variables = [
            close_price, updated_at, total_profit_loss, is_checked, equity, id, false, percent_profit_loss
        ]
        const {rows} = await postgres.pool.query(sql, variables)
        
        if(rows.length == 0){
            return resolve(null)
        }
        return resolve(rows[0])

    }catch(error){
        console.log(error)
        return reject(error)
    }
})

module.exports = {
    stop_order
}