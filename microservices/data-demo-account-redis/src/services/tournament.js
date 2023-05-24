const postgres = require('../core/postgres')
const { STATUS_ACTIVE, STATUS_PENDING, TOURNAMENT_DELETE_STATUS, STATUS_CANCEL } = require('../../constants/constants')
const handler_hasura = require('../helpers/handler_hasura')

const get_order_in_tournament_expired = () => new Promise(async(resolve, reject) => {
    try {
        const current_time = new Date().toISOString()

        //test
        // const sql = `
        //   select t.*,  dh.*
        //   from demo_history_forex as dh
        //     INNER JOIN tournament as t
        //       ON dh.tournament_id = t.id
        //   where t.end_time > $1 and dh.status = any($2)
        // `

        //real
        const sql = `
          select dh.* 
          from demo_history_forex as dh
            INNER JOIN tournament as t
              ON dh.tournament_id = t.id
          where (t.end_time <= $1 or t.status = $2) and dh.status = any($3)
        `

        const variables = [
            current_time,
            TOURNAMENT_DELETE_STATUS, [STATUS_PENDING, STATUS_ACTIVE]

        ]

        const { rows } = await postgres.pool.query(sql, variables)
            // console.log({ rows })
        return resolve(rows)

    } catch (error) {
        console.log(error)
        return reject(error)
    }
})


const get_tournament_expired_or_deleted = (is_deleted_redis = false) => new Promise(async (resolve, reject) =>{
  try{
    const sql = `select * from tournament where (status = $1 or end_time <= $2) and is_deleted_redis = $3`

    const current_time = new Date().toISOString()

    const variables = [
      TOURNAMENT_DELETE_STATUS, current_time, is_deleted_redis
    ]

    const {rows} = await postgres.pool.query(sql, variables)
    return resolve(rows)

  }catch(error){
    console.log(error)
    return reject(error)
  }

})

const close_order_in_tournament_deleted = () => new Promise(async(resolve, reject) => {
    try {
        const current_time = new Date().toISOString()

        const sql = `
      
      update demo_history_forex as dh
        set updated_at = $1, status = $2, end_time = $1
      FROM tournament as t
        where t.status = $3 and dh.status = any($4) AND dh.tournament_id = t.id

    `
        const variables = [
            current_time, STATUS_CANCEL,
            TOURNAMENT_DELETE_STATUS, [STATUS_PENDING, STATUS_ACTIVE]
        ]

        const { rows } = await postgres.pool.query(sql, variables)
            // console.log({ rows })
        return resolve(rows)
    } catch (error) {
        console.log(error)
        return reject(error)
    }
})

const get_tournament_by_id = (item) => new Promise(async(resolve, reject) => {
    try {
        const { tournament_id } = item

        const GET_TOURNAMENT = `query MyQuery($tournament_id: uuid!) {
            tournament(where: {id: {_eq: $tournament_id}}) {
              id
              default_balance
              created_by
              created_at
              end_time
              frequency
              guide_join
              is_default
              is_finished
              link_rule_condition
              method_receive_reward
              min_amount
              name
              object
              option_trade
              organizer
              product_type
              start_time
              status
              total_reward
              updated_at
              updated_by
            }
          }`
        const variables = { tournament_id }

        const result = await handler_hasura(variables, GET_TOURNAMENT)
        if (result.data.tournament.length == 0) {
            return reject(`Tournament :${tournament_id} không tồn tại`)
        }
        return resolve(result.data.tournament[0])
    } catch (err) {
        console.error(err)
        return reject(err)
    }
})

const update_tournament = (tournament_id = []) => new Promise(async(resolve, reject) => {
    try {

        //update is_finished
        const UPDATE_TOURNAMENT = `mutation MyMutation($tournament_id: [uuid!]) {
            update_tournament(where: {id: {_in: $tournament_id}}, _set: {is_finished: false, is_deleted_redis: true}) {
              returning {
                id
                name
                is_finished
              }
            } 
          }
          `
        const variables = {
            tournament_id,
        }

        const result = await handler_hasura(variables, UPDATE_TOURNAMENT)

        return resolve(result)
    } catch (err) {
        console.error(err)
        return reject(err)
    }
})

const get_demo_account_in_tournament_finished = (tournament_id) => new Promise(async(resolve, reject) => {
    try {
        const GET_DEMO_ACCOUNT = `query MyQuery($current_time: timestamptz, $status: Int,$status_delete: Boolean, $tournament_id: uuid) {
            demo_account(where: {
              tournament: {
                _or: [
                  {end_time: {_lte: $current_time}}, 
                  {status: {_eq: $status}}
                ], 
                is_deleted_redis: {_eq: $status_delete},
                id: {_eq: $tournament_id}
              }
            }) 
            {
              user_id
              tournament_id
              balance
              tournament {
                product_type
                is_finished
                id
                name
                start_time
                status
                end_time
              }
            }
          }
          `

        const variables = {
            current_time: new Date().toISOString(),
            status: TOURNAMENT_DELETE_STATUS,
            status_delete: false,
            tournament_id
        }

        const result = await handler_hasura(variables, GET_DEMO_ACCOUNT)

        return resolve(result.data.demo_account)
    } catch (err) {
        console.error(err)
        return reject(err)
    }
})

module.exports = {
    get_order_in_tournament_expired,
    get_tournament_expired_or_deleted,
    close_order_in_tournament_deleted,
    get_tournament_by_id,
    update_tournament,
    get_demo_account_in_tournament_finished
}