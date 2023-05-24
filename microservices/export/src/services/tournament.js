const handler_hasura = require('../helpers/handler_hasura')
const convert_time = require('../helpers/convert_time')
const upload_s3 = require('../helpers/upload_s3')
const xlsx = require('node-xlsx')
const { TYPE_TRADE_NAME, PRODUCT_TRADE_NAME } = require('../../constants/constants')

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

    //status
    const status = item.status
    let query_status = ``
    if (item.status) {
      query_status = `status: {_in: $status},`
      variables.status = status
    }

    //option_trade
    const option_trade = item.option_trade
    let query_option_trade = ``
    if (item.option_trade) {
      query_option_trade = `option_trade: {_eq: $option_trade},`
      variables.option_trade = option_trade
    }

    //product_type
    const product_type = item.product_type
    let query_product_type = ``
    if (item.product_type) {
      query_product_type = `product_type: {_in: $product_type}, `
      variables.product_type = product_type
    }

    let query_time = ``
    //start_time
    const start_time_month_year = item.start_time_month_year
    if (item.start_time_month_year) {
      query_time = `_or: [`
      start_time_month_year.forEach(month_year => {
        const result_split = month_year.split("/")
        const month = result_split[0]
        const year = result_split[1]

        let next_year = year
        let next_month = (parseInt(month) + 1).toString()
        if (month === '12') {
          next_month = 1
          next_year = (parseInt(year) + 1).toString()
        }
        query_time += `{start_time: {_gte: "${year}-${month}-01", _lte: "${next_year}-${next_month}-01"}},`
      })
      query_time += `]`
    }

    //end_time
    const end_time_month_year = item.end_time_month_year
    if (item.end_time_month_year) {
      query_time = `_or: [`
      end_time_month_year.forEach(month_year => {
        const result_split = month_year.split("/")
        const month = result_split[0]
        const year = result_split[1]

        let next_year = year
        let next_month = (parseInt(month) + 1).toString()
        if (month === '12') {
          next_month = 1
          next_year = (parseInt(year) + 1).toString()
        }
        query_time += `{end_time: {_gte: "${year}-${month}-01", _lte: "${next_year}-${next_month}-01"}},`
      })
      query_time += `]`
    }

    //Lấy những giải đang hoạt động
    let query_tournament_running = ``
    if (item.current_time) {
      query_tournament_running = `start_time:{_lte: $current_time}, end_time:{_gte:$current_time},`
      variables.current_time = item.current_time
    }

    //Lấy theo brand
    let query_brand = ``
    if (item.brand) {
      query_brand = `brand_tournaments: {brand_id: {_in: $brand}},`
      variables.brand = item.brand
    }

    //Lấy theo trạng thái hoạt động của tournament: tất cả, đang diễn ra, chưa diễn ra, đã diễn ra
    const status_time = item.status_time || null
    let query_status_time = ``
    variables.now_time = new Date().toISOString()
    switch (status_time) {
      case 1://status_time giải đấu đang diễn ra
        query_status_time = `start_time: {_lte: $now_time}, end_time: {_gte: $now_time},`
        break;
      case 2://status_time giải đấu chưa diễn ra
        query_status_time = `start_time: {_gte: $now_time},`
        break;
      case 3://status_time giải đấu đã diễn ra
        query_status_time = `end_time: {_lte: $now_time},`
        break;
      default://status_time lấy tất cả giải đấu
        query_status_time = ``
        delete variables.now_time
        break;
    }

    const GET_LIST = `query MyQuery($page_size: Int, $offset: Int, $sort_direction: order_by, $search: String, $option_trade: Int, $product_type: [Int!],$status:[Int!],$current_time: timestamptz,$brand: [uuid!], $now_time: timestamptz) {
            tournament(${query_limit} offset: $offset, order_by: {${sort_by}: $sort_direction}, 
              where: {
                name: {_ilike: $search}, 
                ${query_option_trade}
                ${query_product_type}
                ${query_status}
                ${query_time}
                ${query_tournament_running}
                ${query_brand}
                ${query_status_time}
              }) 
            {
              id
              name
              created_at
              start_time
              end_time
              status
              option_trade
              product_type
              organizer
              total_reward
              cover_image
              default_balance
              min_amount
              max_amount
              method_receive_reward
              object
              link_rule_condition
              reward_receiving_term
              reward_receiving_condition
              demo_accounts_aggregate {
                aggregate {
                  count
                }
              }
              rewards {
                id
                name
                value
                amount
                level
                picture
              }
              reward_rule_tournaments {
                reward_rule {
                    id
                    name
                    format_name
                }
              }
              leverage_tournaments {
                leverage {
                    id
                    leverage
                }
              }
              brand_tournaments {
                  brand_id
              }
              brand_tournaments_aggregate {
                aggregate {
                  count
                }
              }
            }
            tournament_aggregate(where: {
                name: {_ilike: $search}, 
                ${query_option_trade}
                ${query_product_type}
                ${query_status}
                ${query_time}
                ${query_tournament_running}
                ${query_status_time}
              }) {
              aggregate {
                count
              }
            }
          }`

    const response = await handler_hasura(variables, GET_LIST)

    return resolve({
      list_tournament: response.data.tournament,
      total_items: response.data.tournament_aggregate.aggregate.count
    })
  } catch (err) {
    console.error(err)
    return reject(err)
  }
})

const export_tournament = (item) => new Promise(async (resolve, reject) => {
  try {
    const { list_tournament } = await get_list(item)

    //Tạo Buffer để export
    const data_export = list_tournament.map(record => {
      //format lại start_time và end_time
      const start_time = convert_time(record.start_time)
      const end_time = convert_time(record.end_time)

      const data = {
        name: record.name,
        type_trade: TYPE_TRADE_NAME[record.option_trade],
        product_trade: PRODUCT_TRADE_NAME[record.product_type], // Nhóm sản phẩm giao dịch
        start_time,
        end_time,
        organizer: record.organizer, // Ban tổ chức
        sponsor: ``, //Đơn vị tài trợ
        total_reward: record.total_reward, // Tổng giá trị giải thưởng
        count_user: record.demo_accounts_aggregate.aggregate.count // Số lượng người tham gia
      }
      return Object.values(data)
    })
    const format_data = [
      [`Tên cuộc thi`, `Hình thức thi`, `Nhóm sản phẩm`, `Ngày bắt đầu`, `Ngày kết thúc`, `Ban tổ chức`, `Đơn vị tài trợ`, `Tổng giá trị giải thưởng`, `Số lượng người tham gia`],
      ...data_export
    ]

    var wscols = [{ wpx: 1000 }];
    const options = {
      '!cols': [
        { wch: 25 },
        { wch: 15 },
        { wch: 17 },
        { wch: 20 },
        { wch: 20 },
        { wch: 20 },
        { wch: 15 },
        { wch: 20 },
        { wch: 20 },

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
  export_tournament
}