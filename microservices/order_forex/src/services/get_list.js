const handler_hasura = require('../helpers/handler_hasura')
const { STATUS_ACTIVE, STATUS_PENDING } = require('../../constants/constants')

//Input: start_day,end_day,sort_by,sort_direction,page_size,current_page,user_list,status,tournament_list
module.exports = (item) => new Promise(async(resolve, reject) => {
    console.log(`function  get list`, item)
    try {
        const start_day = item.start_day || '2000-01-01'
        const end_day = item.end_day || '3000-01-01'
        const sort_by = item.sort_by || 'created_at'
        const sort_direction = item.sort_direction || 'desc'
        const page_size = item.page_size || 20
        const page_number = item.current_page || 0
        const user_list = item.user_list || []
        const offset = page_size * page_number
        const status = item.status || []
        const tournament_list = item.tournament_list || []

        let query_status = `_in`
        if (status.length < 1) {
            query_status = `_nin`
        }

        let query_tournament = `_in`
        if (tournament_list.length < 1) {
            query_tournament = `_nin`
        }

        let query_list_user_list = `_in`
        if (user_list.length < 1) {
            query_list_user_list = `_nin`
        }

        const GET_LIST = `
            query MyQuery($offset: Int, $limit: Int, $start_day: timestamptz, $end_day: timestamptz, $status: [Int!], $user_list: [uuid!], $sort_direction: order_by, $tournament_list: [uuid!]) {
                demo_history_forex(
                        offset: $offset, limit: $limit,
                        where: {
                           created_at: {_gte: $start_day, _lte: $end_day}, 
                           status: {${query_status}: $status}, 
                           user_id: {${query_list_user_list}: $user_list},
                           tournament_id: {${query_tournament}: $tournament_list}                      
                        }, 
                        order_by: {${sort_by}: $sort_direction}) {
                    id
                    count_id
                    asset
                    status
                    close_price
                    created_at
                    dividends
                    end_time
                    gross_profit_loss                
                    leverage
                    margin
                    net_profit_loss
                    open_price
                    pending_price
                    quantity
                    start_time
                    stop_loss
                    swap
                    take_profit
                    transaction_type
                    type
                    updated_at
                    user_id
                    user_profile {
                        email
                        name
                        id
                    }
                    tournament {
                        updated_at
                        start_time
                        organizer
                        name
                        end_time
                        id
                        created_at
                    }
                    tournament_id
                }

                demo_history_forex_aggregate(where: {
                    status: {${query_status}: $status}, 
                    user_id: {${query_list_user_list}: $user_list}, 
                    created_at: {_gte: $start_day, _lte: $end_day},
                    tournament_id: {${query_tournament}: $tournament_list}
                }) 
                {
                    aggregate {
                        count
                    }
                }
            }
        `

        const variables = {
            user_list,
            start_day,
            end_day,
            offset,
            sort_direction,
            limit: page_size,
            status,
            tournament_list,
        }

        const result = await handler_hasura(variables, GET_LIST)
        const order_list = result.data.demo_history_forex


        const total_items = result.data.demo_history_forex_aggregate.aggregate.count

        const data = {
            list: order_list,
            total_items
        }
        return resolve(data)

    } catch (error) {
        console.log(error)
        return reject(error)
    }

})