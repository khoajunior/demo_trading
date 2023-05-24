const handler_hasura = require('../helpers/handler_hasura')
const convert_time = require('../helpers/convert_time')
const upload_s3 = require('../helpers/upload_s3')
const xlsx = require('node-xlsx')
const {TYPE_BUY, TYPE_SELL,TYPE_ORDER_NAME}=require('../../constants/constants')

const get_list_cfd = (item) => new Promise(async(resolve, reject) => {
    try {
        const variables = {}

        //Sort
        const sort_by = item.sort_by || `created_at`
        const sort_direction = item.sort_direction || `desc`
        variables.sort_direction=sort_direction

        //Pagination
        const page_size = item.page_size
        let query_limit=``
        if(page_size){
            query_limit = `limit: $page_size,`
            variables.page_size=page_size
        }

        const current_page = item.current_page
        let offset
        if (!item.current_page) {
            offset = 0
        } else {
            offset = (page_size * current_page)
        }
        variables.offset=offset

        //tournament_id
        let query_tournament=``
        if(item.tournament_id){
            query_tournament=`tournament_id: {_eq: $tournament_id},`
            variables.tournament_id=item.tournament_id
        }

        //status
        let query_status=``
        if(item.status){
            query_status=`status: {_in: $status},`
            variables.status=item.status
        }

        //user_id
        let query_user=``
        if(item.user_id){
            query_user=`user_id: {_eq: $user_id},`
            variables.user_id=item.user_id
        }

        //type_order
        let type=item.type || [TYPE_BUY,TYPE_SELL]
        variables.type=type

        const GET_LIST=`query MyQuery($page_size: Int, $offset: Int, $sort_direction: order_by,$status:[Int!],$tournament_id:uuid,$type:[Int!],$user_id: uuid) {
            demo_history_forex(${query_limit} offset: $offset, order_by: {${sort_by}: $sort_direction}, 
                where: {
                    ${query_user}
                    ${query_tournament}
                    ${query_status} 
                    type: {_in: $type}
                }) 
                {
                    id
                    asset
                    quantity
                    type
                    start_time
                    end_time
                    open_price
                    close_price
                    take_profit
                    stop_loss
                    pending_price
                    net_profit_loss
                    swap
                    created_at
                    updated_at
                    tournament{
                        id
                        name
                        option_trade
                        product_type
                    }
                    user_profile{
                        id
                        name
                        username
                        email
                        national_id
                        phone_number
                    }
                }
            demo_history_forex_aggregate(
                where: {
                    ${query_user}
                    ${query_tournament}
                    ${query_status} 
                    type: {_in: $type}
                }) {
                    aggregate {
                        count
                    }
                }
            }`
        
        const result = await handler_hasura(variables,GET_LIST)

        return resolve({
            list_order: result.data.demo_history_forex,
            total_items: result.data.demo_history_forex_aggregate.aggregate.count
        })
    } catch (err) {
        console.error(err)
        return reject(err)
    }
})

const export_order_cfd = (item) => new Promise(async(resolve, reject) => {
    try{
        const {list_order}=await get_list_cfd(item)

        //Tạo Buffer để export
        const data_export = list_order.map(record => {
            //format lại start_time và end_time
            const start_time = convert_time(record.start_time)
            const end_time = convert_time(record.end_time)

            const data = {
                tournament_name: record.tournament.name,
                asset: record.asset,
                quantity: record.quantity,
                type: TYPE_ORDER_NAME[record.type],
                start_time,
                end_time,
                open_price: record.open_price,
                close_price: record.close_price,
                take_profit: record.take_profit,
                stop_loss: record.stop_loss,
                net_profit_loss: record.net_profit_loss                
            }
            return Object.values(data)
        })
        const format_data = [
            [`Tên giải`, `Tài sản`, `Số lot`, `Loại lệnh`, `Thời gian bắt đầu lệnh`, `Thời gian kết thúc lệnh`, `Giá mở cửa`, `Giá đóng cửa`, `Giá chốt lời`, `Giá cắt lỗ`, `Lợi nhuận`],
            ...data_export
        ]

        var wscols = [{ wpx: 1000 }];
        const options = {
            '!cols': [
                { wch: 25 },
                { wch: 10 },
                { wch: 10 },
                { wch: 10 },
                { wch: 25 },
                { wch: 25 },
                { wch: 15 },
                { wch: 15 },
                { wch: 15 },
                { wch: 15 },
                { wch: 20 },                
                wscols,
            ],
        };

        var buffer = xlsx.build([{ data: format_data }], options); // Returns a buffer

        //Upload lên s3
        const url = await upload_s3({ data: buffer }, `order`)
        return resolve(url)
    }catch(err){
        console.log({err})
        return reject(err)
    }
})

const get_list_binary = (item) => new Promise(async(resolve, reject) => {
    try {
        const variables = {}

        //Sort
        const sort_by = item.sort_by || `created_at`
        const sort_direction = item.sort_direction || `desc`
        variables.sort_direction=sort_direction

        //Pagination
        const page_size = item.page_size
        let query_limit=``
        if(page_size){
            query_limit = `limit: $page_size,`
            variables.page_size=page_size
        }

        const current_page = item.current_page
        let offset
        if (!item.current_page) {
            offset = 0
        } else {
            offset = (page_size * current_page)
        }
        variables.offset=offset

        //tournament_id
        let query_tournament=``
        if(item.tournament_id){
            query_tournament=`tournament_id: {_eq: $tournament_id},`
            variables.tournament_id=item.tournament_id
        }

        //status
        let query_status=``
        if(item.status===true || item.status===false){
            query_status=`is_checked: {_eq: $status},`
            variables.status=item.status
        }

        //user_id
        let query_user=``
        if(item.user_id){
            query_user=`user_id: {_eq: $user_id},`
            variables.user_id=item.user_id
        }

        //type_order
        let type=item.type || [TYPE_BUY,TYPE_SELL]
        variables.type=type

        const GET_LIST=`query MyQuery($page_size: Int, $offset: Int, $sort_direction: order_by, $status: Boolean, $tournament_id: uuid, $type: [Int!],$user_id: uuid) {
            demo_history_binary(
              ${query_limit}
              offset: $offset, 
              order_by: {${sort_by}: $sort_direction}, 
              where: {
                ${query_user}
                ${query_tournament}
                ${query_status}
                type: {_in: $type}
              }) 
            {
              id
              asset
              investment
              type
              start_time
              end_time
              open_price
              close_price
              is_checked
              created_at
              updated_at
              tournament {
                id
                name
                option_trade
                product_type
              }
              user_profile {
                id
                name
                username
                email
                national_id
                phone_number
              }
            }
            demo_history_binary_aggregate(where: {
                    ${query_user}
                    ${query_tournament}
                    ${query_status}
                    type: {_in: $type}
                }) 
                {
                    aggregate {
                        count
                }
            }
        }`
        
        const result = await handler_hasura(variables,GET_LIST)

        return resolve({
            list_order: result.data.demo_history_binary,
            total_items: result.data.demo_history_binary_aggregate.aggregate.count
        })
    } catch (err) {
        console.error(err)
        return reject(err)
    }
})

const export_order_binary = (item) => new Promise(async(resolve, reject) => {
    try{
        const {list_order}=await get_list_binary(item)

        //Tạo Buffer để export
        const data_export = list_order.map(record => {
            //format lại start_time và end_time
            const start_time = convert_time(record.start_time)
            const end_time = convert_time(record.end_time)

            const data = {
                tournament_name: record.tournament.name,
                asset: record.asset,
                investment: record.investment,
                type: TYPE_ORDER_NAME[record.type],
                start_time,
                end_time,
                open_price: record.open_price,
                close_price: record.close_price,
                net_profit_loss: record.net_profit_loss                
            }
            return Object.values(data)
        })
        const format_data = [
            [`Tên giải`, `Tài sản`, `Số tiền`, `Loại lệnh`, `Thời gian bắt đầu lệnh`, `Thời gian kết thúc lệnh`, `Giá mở cửa`, `Giá đóng cửa`, `Lợi nhuận`],
            ...data_export
        ]

        var wscols = [{ wpx: 1000 }];
        const options = {
            '!cols': [
                { wch: 25 },
                { wch: 10 },
                { wch: 10 },
                { wch: 10 },
                { wch: 25 },
                { wch: 25 },
                { wch: 15 },
                { wch: 15 },
                { wch: 20 },                
                wscols,
            ],
        };

        var buffer = xlsx.build([{ data: format_data }], options); // Returns a buffer

        //Upload lên s3
        const url = await upload_s3({ data: buffer }, `order`)
        return resolve(url)
    }catch(err){
        console.log({err})
        return reject(err)
    }
})

module.exports = {
    get_list_cfd,
    export_order_cfd,
    get_list_binary,
    export_order_binary
}