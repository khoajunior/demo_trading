const handler_hasura = require('../helpers/handler_hasura')
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

        //Lọc theo brand
        let query_id = ``
        if (item.id) {
            query_id = `id: {_in: $id},`
            variables.id = item.id
        }

        //Lọc theo status brand
        let query_status = ``
        if (item.status) {
            query_status = `status: {_in: $status},`
            variables.status = item.status
        }

        const GET_LIST = `query MyQuery( $sort_direction: order_by, $search: String, $status: [Int!],$id:[uuid!]) {
            brand(where: {
                name: {_ilike: $search}, 
                ${query_status}
                ${query_id}
            }, order_by: {${sort_by}: $sort_direction}) {
              id
              name
              company_name
              address
              status
              tax
              logo
              description
              phone_number
              email
              website
              created_at
              updated_at
              brand_tournaments {
                  tournament {
                    id
                    name
                    option_trade
                    product_type
                    created_at
                    updated_at
                    brand {
                        id
                        name
                    }
                    demo_accounts {
                        id
                        balance
                        rank
                    }
                    total_reward
                    status
                  }
                }
            }
            brand_aggregate(where: {
                name: {_ilike: $search}, 
                ${query_status}
                ${query_id}
            }) {
              aggregate {
                count
              }
            }
          }
          `

        const response = await handler_hasura(variables, GET_LIST)

        //Lọc theo số giải
        const min_count_tournament = item.min_count_tournament || 0
        const max_count_tournament = item.max_count_tournament || 1000000000

        let list_brand = []
        response.data.brand.forEach(brand => {
            let count_tournament = brand.brand_tournaments.length
            brand.count_tournament = count_tournament

            if (count_tournament >= min_count_tournament && count_tournament <= max_count_tournament) {
                list_brand.push(brand)
            }
        })

        var total_items = list_brand.length


        //Phân trang theo page_size và limit
        const page_size = item.page_size || 1000000
        const current_page = item.current_page
        let offset
        if (!item.current_page) {
            offset = 0
        } else {
            offset = (page_size * current_page)
        }

        if (item.page_size) {
            list_brand = list_brand.slice(offset, offset + page_size)
        } else {
            list_brand = list_brand.slice(offset)
        }

        return resolve({
            list_brand,
            total_items
        })
    } catch (err) {
        console.error(err)
        return reject(err)
    }
})

const export_brand = (item) => new Promise(async (resolve, reject) => {
    try {
        const { list_brand } = await get_list(item)

        //Tạo Buffer để export
        const data_export = list_brand.map(record => {
            const { id, name, company_name, count_tournament, status } = record

            let status_name = `Active`
            if (status === 2) {
                status_name = `Inactive`
            }

            const data = {
                id, name, company_name, count_tournament, status_name
            }
            return Object.values(data)
        })
        const format_data = [
            [`Mã số`, `Tên brand`, `Công ty`, `Số giải tổ chức`, `Trạng thái`],
            ...data_export
        ]

        var wscols = [{ wpx: 1000 }];
        const options = {
            '!cols': [
                { wch: 20 },
                { wch: 20 },
                { wch: 20 },
                { wch: 20 },
                { wch: 15 },
                wscols,
            ],
        };

        var buffer = xlsx.build([{ data: format_data }], options); // Returns a buffer

        //Upload lên s3
        const url = await upload_s3({ data: buffer }, `tournament`)
        return resolve(url)
    } catch (err) {
        console.error(err)
        return reject(err)
    }
})

module.exports = {
    get_list,
    export_brand
}