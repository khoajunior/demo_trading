const postgres = require('../core/postgres')
const { STATUS_CLOSE, STATUS_ACTIVE, STATUS_PENDING, STATUS_CANCEL } = require('../../constants/constants')
const { get_fn_net_profit_loss, get_margin } = require('./support_handler')
const get_demo_account_by_user = require('./get_demo_account_by_user')

// if update pending => active but margin not enought 
const cancel_pending_order_list = (id_list) => new Promise(async (resolve, reject) => {
    try {

        const variables = [
            new Date().toISOString(),
            STATUS_CANCEL,
            STATUS_PENDING,
            id_list
        ]
        const sql = `update demo_history_forex 
          set updated_at = $1, status = $2 
          where  status = $3 and count_id = any($4)
          returning *
        `
        const { rows } = await postgres.pool.query(sql, variables)
        return resolve(rows)

    } catch (error) {
        console.log(error)
        return reject(error)
    }
})



const stop_order = (item) => new Promise(async (resolve, reject) => {
    try {
        const { count_id_list, close_price, end_time, is_setting_balance_to_rezo = false } = item

        // return old data before updated
        var sql = `    
                with updated as (update demo_history_forex  
                    set close_price = $1,  end_time= $2, updated_at = $3, status = $5, net_profit_loss = fn_net_profit_loss * ($1 - open_price) 
                    where count_id = any($4) and status = $6
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

        if (is_setting_balance_to_rezo) {
            sql = `    
            with updated as (update demo_history_forex  
                set close_price = $1,  end_time= $2, updated_at = $3, status = $5, net_profit_loss = fn_net_profit_loss * ($1 - open_price) 
                where count_id = any($4) and status = $6
              returning *
            ), updated_demo as (
                UPDATE demo_account 
                set balance = 0, updated_at = $3
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
        }


        const updated_at = new Date().toISOString()
        const variables = [
            close_price, end_time, updated_at, count_id_list, STATUS_CLOSE, STATUS_ACTIVE
        ]

        const { rows } = await postgres.pool.query(sql, variables)
        return resolve(rows)
    } catch (error) {
        console.log(error)
        return reject(error)
    }
})


//id_list contain count_id because save zadd in redis
const update_pending_to_active = (item) => new Promise(async (resolve, reject) => {

    // update demo_account with updated_at for frontend listend and change total_net_profit_loss
    try {
        console.log('update pending to active------------------')
        const { count_id_list, open_price, start_time, price_type } = item
        const cancel_order_list = []

        var sql = `SELECT forex.*, margin.total_margin, dc.balance
           FROM demo_history_forex as forex
            left join demo_account as dc on dc.user_id = forex.user_id and dc.tournament_id = forex.tournament_id
            LEFT JOIN (
                select d.user_id, d.tournament_id, sum(d.margin) as total_margin
                from demo_history_forex as d
                where d.status = $3
                group by d.user_id, d.tournament_id 
            ) as margin
            on margin.user_id = forex.user_id and margin.tournament_id = forex.tournament_id        
           WHERE forex.count_id = any($1) and forex.status = $2 
        `
        var variables = [count_id_list, STATUS_PENDING, STATUS_ACTIVE]
        const { rows: order_list } = await postgres.pool.query(sql, variables)

        const order_promise = []
        const new_order_list = []
        for (var i = 0; i < order_list.length; i++) {
            const order = order_list[i]
            const { quantity, type, asset, leverage, count_id, user_id, tournament_id } = order

            const fn_net_profit_loss = await get_fn_net_profit_loss(open_price, quantity, type, asset, price_type)
            const margin = await get_margin(quantity, leverage, asset, price_type)

            order.open_price = open_price
            order.fn_net_profit_loss = fn_net_profit_loss,
                order.status = STATUS_ACTIVE,
                order.margin = margin


            const user_demo_account = await get_demo_account_by_user({ user_id, tournament_id, type: price_type })
            const { available } = user_demo_account
            const is_check_margin = available - margin

            if (is_check_margin < 0) {
                cancel_order_list.push(count_id)
                continue
            }

            new_order_list.push(order)

            sql = `
                with updated as(update demo_history_forex 
                set open_price = $1, start_time = $2, updated_at = $3, status = $4, fn_net_profit_loss = $7, margin = $8 
                where count_id = $5 and status = $6
                returning *
                ), updated_demo as (
                    UPDATE demo_account
                    set updated_at = $3
                    from (
                        select user_id, tournament_id from updated
                        group by user_id, tournament_id
                    ) as sub
                    where demo_account.user_id = sub.user_id and demo_account.tournament_id = sub.tournament_id
                    returning demo_account.*
                )
                select * from updated 
            `

            const updated_at = new Date().toISOString()

            variables = [
                open_price, start_time, updated_at, STATUS_ACTIVE,
                count_id, STATUS_PENDING, fn_net_profit_loss, margin
            ]

            const handle_updating_order = postgres.pool.query(sql, variables)
            order_promise.push(handle_updating_order)

        }

        await Promise.all(order_promise)
        const new_cancel_list = await cancel_pending_order_list(cancel_order_list)
        // console.log({new_cancel_list})

        return resolve({ new_order_list, new_cancel_list })

    } catch (error) {
        console.log(error)
        return reject(error)
    }
})


const stop_order_pending_list = (pending_item) => new Promise(async (resolve, reject) => {
    try {

        const { user_tournament } = pending_item
        const { user_id, tournament_id } = user_tournament
        const updated_at = new Date().toDateString()

        const sql = `
           update demo_history_forex
             set status = $1, updated_at = $2
            where user_id = $3 and tournament_id = $4 and status = $5
            returning *
        `

        const variables = [
            STATUS_CANCEL, updated_at, user_id, tournament_id, STATUS_PENDING
        ]

        const { rows } = await postgres.pool.query(sql, variables)
        // console.log({rows})

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
    update_pending_to_active,
    stop_order_pending_list,
    get_order_list,
    cancel_pending_order_list
}