const handler_hasura = require('../helpers/handler_hasura')
const convert_time = require('../helpers/convert_time')
const upload_s3 = require('../helpers/upload_s3')
const xlsx = require('node-xlsx')

const get_list = (item) => new Promise(async (resolve, reject) => {
    try {
        const variables = {}

        //Search
        let search = item.search
        if (search) {
            search = `%${search}%`
        } else {
            search = `%%`
        }
        variables.search = search

        //Sort
        const sort_by = item.sort_by || `created_at`
        const sort_direction = item.sort_direction || `desc`
        variables.sort_direction = sort_direction

        //Pagination
        const page_size = item.page_size
        let query_limit = ``
        if (page_size) {
            query_limit = `limit: $page_size,`
            variables.page_size = page_size
        }

        const current_page = item.current_page
        let offset
        if (!item.current_page) {
            offset = 0
        } else {
            offset = (page_size * current_page)
        }
        variables.offset = offset

        //National id
        const status_national_id = item.status_national_id
        let query_status_national_id = ``
        if (status_national_id === true) {
            query_status_national_id = `national_id: {_is_null: false},`
        }
        if (status_national_id === false) {
            query_status_national_id = `national_id: {_is_null: true},`
        }

        //check verified otp
        const status_verified_otp = item.status_verified_otp
        let query_verified_otp = ``
        if (status_verified_otp === true || status_verified_otp === false) {
            query_verified_otp = `is_verified_otp: {_eq: ${status_verified_otp}},`
        }

        //role
        const role = item.role || []
        let query_role = ``
        if (item.role) {
            query_role = `role: {_in: $role},`
            variables.role = role
        }

        //tournament_id
        const tournament_id = item.tournament_id
        let query_tournament = ``
        if (item.tournament_id) {
            query_tournament = `demo_accounts: {tournament_id: {_in: $tournament_id}},`
            variables.tournament_id = tournament_id
        }

        const GET_USER = `query MyQuery($page_size: Int, $offset: Int, $sort_direction: order_by, $search: String, $role: [String!], $tournament_id:[uuid!]) {
                user_profile(
                    order_by: {
                        ${sort_by}: $sort_direction
                    }, ${query_limit} offset: $offset, 
                    where: {
                        _or: [{name: {_ilike: $search}}, {email: {_ilike: $search}}, {username: {_ilike: $search}}], 
                        ${query_status_national_id}
                        ${query_verified_otp}
                        ${query_role}
                        ${query_tournament}
                    }) 
                    {
                        id
                        username
                        email
                        birthday
                        front_url_national_id
                        back_url_national_id
                        national_id
                        phone_number
                        is_verified_otp
                        role
                        brand_id
                        created_at
                        avatar
                        gender
                        name
                        is_deleted
                        updated_at
                    }
                    user_profile_aggregate(where: {
                        _or: [{name: {_ilike: $search}}, {email: {_ilike: $search}}, {username: {_ilike: $search}}], 
                        ${query_status_national_id}
                        ${query_verified_otp}
                        ${query_role}
                        ${query_tournament}
                    }) {
                        aggregate {
                            count
                        }
                    }
                }`

        const response = await handler_hasura(variables, GET_USER)

        return resolve({
            list_user: response.data.user_profile,
            total_items: response.data.user_profile_aggregate.aggregate.count
        })
    } catch (err) {
        console.error(err)
        return reject(err)
    }
})

const export_user = (item) => new Promise(async (resolve, reject) => {
    try {
        const { list_user } = await get_list(item)

        //Tạo Buffer để export
        const data_export = list_user.map(record => {
            const { name, email, username, national_id, phone_number, created_at, birthday, gender } = record
            const created_at_convert = convert_time(created_at)
            const data = {
                name, email, username, national_id, phone_number, gender, created_at_convert
            }
            return Object.values(data)
        })
        const format_data = [
            [`Họ tên`, `Email`, `Tên hiển thị`, `Số chứng minh thư`, `Số điện thoại`, `Giới tính`, `Ngày tạo tài khoản`],
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
                { wch: 15 },
                { wch: 30 },
                wscols,
            ],
        };

        var buffer = xlsx.build([{ data: format_data }], options); // Returns a buffer

        //Upload lên s3
        const url = await upload_s3({ data: buffer }, `user`)

        return resolve(url)
    } catch (err) {
        console.error(err)
        return reject(err)
    }
})

module.exports = {
    get_list,
    export_user
}