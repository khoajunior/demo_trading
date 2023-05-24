const {
    TYPE_SELL,
    TYPE_BUY,
    STATUS_PENDING,
    STATUS_ACTIVE,
    PRICE_SPREAD_PIPS,
    BUY_LIMIT,
    BUY_STOP,
    SELL_LIMIT,
    SELL_STOP,
    OBJECT_PIP_VALUE
} = require('../../constants/constants')
const handler_hasura = require('../helpers/handler_hasura')
const convert_to_usd = require('../helpers/convert_to_usd')


const get_pip_value = (quantity, asset = 'EUR/USD', open_price, price_type = 'forex') => new Promise(async(resolve, reject) => {
    try {
        let asset_object = OBJECT_PIP_VALUE[asset]
        let result;
        //Trường hợp có định nghĩa asset trong constant
        if (asset_object) {
            result = quantity * asset_object.pip_value
            return resolve(result)
        }

        //Trường hợp forex
        let pip = 0.0001
        if (asset.includes('JPY')) {
            pip = 0.01
        }
        result = quantity * 100000 * pip / open_price

        result = await convert_to_usd(result, asset, price_type)
        return resolve(result)
    } catch (err) {
        return reject(err)
    }
});

//margin value
const get_margin = (quantity, leverage, asset = 'EUR/USD', price_type = 'forex') => new Promise(async(resolve, reject) => {
    try {
        const asset_object = OBJECT_PIP_VALUE[asset]
        var contract_amount = 100000
        if (asset_object) {
            contract_amount = asset_object.amount
        }

        let margin = quantity * contract_amount / leverage

        margin = await convert_to_usd(margin, asset, price_type)

        return resolve(margin)
    } catch (err) {
        return reject(err)
    }
});


//net profit loss
async function get_net_profit_loss(item) {

    const { quantity, open_price, close_price, type, asset = 'EUR/USD', price_type = 'forex' } = item

    //lấy base_pip
    const asset_object = OBJECT_PIP_VALUE[asset]
    let base_pip = 0.0001
    if (asset_object) {
        base_pip = asset_object.base_pip
    } else if (asset.includes('JPY')) {
        base_pip = 0.01
    }

    var scale = 1
    if (type === TYPE_SELL) {
        scale = -1
    }

    //Lấy pip_value -> tính net PL
    const pip_values = await get_pip_value(quantity, asset, open_price, price_type)
    let net_profit_loss = pip_values * scale * (close_price - open_price) / base_pip

    return net_profit_loss
};


// fn net profit loss
async function get_fn_net_profit_loss(open_price, quantity, type, asset, price_type = 'forex') {

    var scale = 1
    if (type === TYPE_SELL) {
        scale = -1
    }

    //lấy base_pip
    const asset_object = OBJECT_PIP_VALUE[asset]
    let base_pip = 0.0001
    if (asset_object) {
        base_pip = asset_object.base_pip
    } else if (asset.includes('JPY')) {
        base_pip = 0.01
    }

    const pip_values = await get_pip_value(quantity, asset, open_price, price_type)
    let net_profit_loss = pip_values * scale / base_pip

    return net_profit_loss
};


const get_balance = (user_id, tournament_id) => new Promise(async(resolve, reject) => {
    try {
        const query = `query MyQuery($user_id: uuid, $tournament_id: uuid) {
            demo_account(where: {user_id: {_eq: $user_id}, tournament_id: {_eq: $tournament_id}}) {
              balance
            }
          }`

        let variables = {
            user_id,
            tournament_id
        }

        const result = await handler_hasura(variables, query)
        return resolve(result.data.demo_account[0].balance)

    } catch (err) {
        console.error(err)
        return reject("user had not yet joined tournament")
    }
});

//get sum margin of all open order by user_id
const get_sum_margin_balance = (user_id, tournament_list, status = [STATUS_PENDING, STATUS_ACTIVE]) => new Promise(async(resolve, reject) => {
    try {
        const tournament = tournament_list || []
        let query_list_tournament = `_in`
        if (tournament.length == 0) {
            query_list_tournament = `_nin`
        }
        const my_query = `query MyQuery($user_id: uuid, $status: [Int!], $tournament_list: [uuid!]) {

            demo_account(where: {user_id: {_eq: $user_id}, tournament_id: {${query_list_tournament}: $tournament_list}}) {
                balance
            }

            demo_history_forex_aggregate(where: {
                user_id: {_eq: $user_id}, 
                status: {_in: $status},
                tournament_id: {${query_list_tournament}: $tournament_list}
            }) 
            {
              aggregate {
                sum {
                  margin
                }
              }
            }
          }
          
          `
        let variables = {
            user_id: user_id,
            status,
            tournament_list: tournament
        }

        const result = await handler_hasura(variables, my_query)
        const data = {
            total_margin: result.data.demo_history_forex_aggregate.aggregate.sum.margin || 0,
            balance: result.data.demo_account[0].balance || 0
        }
        return resolve(data)
    } catch (err) {
        console.log("Error in get_sum_margin: ", err)
        return reject(err)
    }
})

//Check valid take_profit and stop_loss
const check_valid_tp_sl = (stop_loss, take_profit, open_price, type, asset, price_type = 'forex') => new Promise(async(resolve, reject) => {
    try {
        await check_stop_loss(stop_loss, open_price, type, asset, price_type)
        await check_take_profit(take_profit, open_price, type, asset, price_type)

        return resolve(true)
    } catch (err) {
        console.log(`err in check_valid_tp_sl`, err)
        return reject(err)
    }
})

const check_stop_loss = (stop_loss, open_price, type, asset, price_type = 'forex') => new Promise((resolve, reject) => {
    if (!stop_loss) return resolve(true)
    if (stop_loss < 0) {
        return reject('Giá cắt lỗ không hợp lệ')
    }

    //lấy base_pip
    const asset_object = OBJECT_PIP_VALUE[asset]
    let base_pip = 0.0001
    if (asset_object) {
        base_pip = asset_object.base_pip
    } else if (asset.includes('JPY')) {
        base_pip = 0.01
    }

    var spread = Math.abs(stop_loss - open_price)
    spread = Math.round(spread / base_pip)


    if (stop_loss < 0 || spread < PRICE_SPREAD_PIPS) {
        if (type == TYPE_BUY) {
            const stop_loss_valid = open_price - PRICE_SPREAD_PIPS * base_pip
            if (stop_loss_valid >= 0) {
                return reject(`Giá cắt lỗ tối đa là: ${stop_loss_valid.toFixed(5)}`)
            } else {
                return reject(`Không thể đặt giá cắt lỗ trong lệnh này vì quá thấp`)
            }
        }
        if (type == TYPE_SELL) {
            const min_stop_loss = open_price + PRICE_SPREAD_PIPS * base_pip
            return reject(`Giá cắt lỗ tối thiểu là: ${min_stop_loss.toFixed(5)}`)
        }
    }

    if (type === TYPE_BUY && stop_loss > open_price) {
        return reject(`Giá cắt lỗ phải thấp hơn giá mở cửa trong lệnh mua`)
    }

    if (type === TYPE_SELL && stop_loss < open_price) {
        return reject(`Giá cắt lỗ phải cao hơn giá mở cửa trong lệnh bán`)
    }
    return resolve(true)

})

const check_take_profit = (take_profit, open_price, type, asset, price_type = 'forex') => new Promise((resolve, reject) => {
    if (!take_profit) return resolve(true)

    if (take_profit < 0) {
        return reject('Giá chốt lời không hợp lệ')
    }

    //lấy base_pip
    const asset_object = OBJECT_PIP_VALUE[asset]
    let base_pip = 0.0001
    if (asset_object) {
        base_pip = asset_object.base_pip
    } else if (asset.includes('JPY')) {
        base_pip = 0.01
    }

    var spread = Math.abs(take_profit - open_price)
    spread = Math.round(spread / base_pip)
    if (take_profit < 0 || spread < PRICE_SPREAD_PIPS) {
        if (type == TYPE_BUY) {
            const min_take_profit = open_price + PRICE_SPREAD_PIPS * base_pip
            return reject(`Giá chốt lời tối thiểu là: ${min_take_profit.toFixed(5)}`)
        }
        if (type == TYPE_SELL) {
            const take_profit_valid = open_price - PRICE_SPREAD_PIPS * base_pip
            if (take_profit_valid >= 0) {
                return reject(`Giá chốt lời tối đa là: ${take_profit_valid.toFixed(5)}`)
            } else {
                return reject(`Không thể đặt giá chốt lời trong lệnh này vì quá thấp`)
            }
        }
    }

    if (type === TYPE_BUY && take_profit < open_price) {
        return reject(`Giá chốt lời phải cao hơn giá mở cửa trong lệnh mua`)
    }

    if (type === TYPE_SELL && take_profit > open_price) {
        return reject(`Giá chốt lời phải thấp hơn giá mở cửa trong lệnh bán`)
    }
    return resolve(true)

})

const get_transaction_type = (pending_price, open_price, type) => {
    var transaction_type = null

    if (pending_price <= open_price && type == TYPE_BUY) {
        transaction_type = BUY_LIMIT
    }

    if (pending_price > open_price && type == TYPE_BUY) {
        transaction_type = BUY_STOP
    }


    if (pending_price >= open_price && type == TYPE_SELL) {
        transaction_type = SELL_LIMIT
    }

    if (pending_price < open_price && type == TYPE_SELL) {
        transaction_type = SELL_STOP
    }

    return transaction_type
}

// update số dư tài khoản
const update_balance = (item) => new Promise(async(resolve, reject) => {
    try {
        const { user_id, balance, update_type = '_inc', tournament_id } = item
        const mutation = `mutation MyMutation($user_id: uuid, $balance: float8, $tournament_id: uuid, $updated_at: timestamptz) {
        update_demo_account(where: {user_id: {_eq: $user_id}, tournament_id: {_eq: $tournament_id}}, ${update_type}: {balance: $balance}, _set: {updated_at: $updated_at}) {
          returning {
            user_id
            balance
            created_at
            id
            tournament_id
            updated_at
          }
        }
      }`

        let variables = {
            user_id: user_id,
            balance,
            tournament_id,
            updated_at: new Date().toUTCString()
        }

        const result = await handler_hasura(variables, mutation)
        if (result.data.update_demo_account.returning.length < 1) {
            return reject(`Account of user_id: ${user_id} in ${tournament_id} not found`)
        }

        return resolve(result.data.update_demo_account.returning[0])
    } catch (err) {
        return reject("Account not found update balance")
    }
});

const get_all_order = (item) => new Promise(async(resolve, reject) => {
    try {
        const user_list_input = item.user_list || []
        const status_list_input = item.status_list || []
        const asset_list_input = item.asset_list || []
        const tournament_list_input = item.tournament_list || []

        let query_list_user = `_in`
        if (user_list_input.length == 0) {
            query_list_user = `_nin`
        }
        let query_list_status = `_in`
        if (status_list_input.length == 0) {
            query_list_status = `_nin`
        }
        let query_list_asset = `_in`
        if (asset_list_input.length == 0) {
            query_list_asset = `_nin`
        }
        let query_list_tournament = `_in`
        if (tournament_list_input.length == 0) {
            query_list_tournament = `_nin`
        }


        const my_query = `query MyQuery($user_list: [uuid!], $status_list: [Int!], $now_day: timestamptz, $asset_list: [String!], $tournament_list: [uuid!]) {
            demo_history_forex(where: {user_id: {${query_list_user}: $user_list}, status: {${query_list_status}: $status_list}, tournament: {start_time: {_lte: $now_day}, end_time: {_gt: $now_day}}, asset: {${query_list_asset}: $asset_list}, tournament_id: {${query_list_tournament}: $tournament_list}}) {
              id
              count_id
              asset
              quantity
              leverage
              dividends
              open_price
              close_price
              start_time
              end_time
              type
              margin
              status
              pending_price
              take_profit
              stop_loss
              swap
              gross_profit_loss
              fn_net_profit_loss
              net_profit_loss
              user_id
              user_profile {
                name
              }
              created_at
              updated_at
              tournament {
                created_at
                end_time
                id
                name
                organizer
                start_time
                updated_at
              }
              tournament_id
            }

            demo_account(where: {
                tournament_id: {${query_list_tournament}: $tournament_list},
                user_id: {${query_list_user}: $user_list}
            }) {
                balance
                closed_order_at
                created_at
                rank
                tournament_id
                updated_at
                user_id
                total_margin
                reward_id
              }
          }
          `
        const variables = {
            user_list: user_list_input,
            status_list: status_list_input,
            asset_list: asset_list_input,
            now_day: new Date().toISOString(),
            tournament_list: tournament_list_input

        }
        const result = await handler_hasura(variables, my_query)

        return resolve({
            forex_list: result.data.demo_history_forex,
            account: result.data.demo_account[0]
        })

    } catch (err) {
        return reject(err)
    }
})

//input: asset, type, open_price, take_profit_pip
const convert_take_profit_pip = (asset, type, open_price, take_profit_pip, price_type = 'forex') => {
    if (!take_profit_pip) {
        return null
    }

    //lấy base_pip
    const asset_object = OBJECT_PIP_VALUE[asset]
    let base_pip = 0.0001
    if (asset_object) {
        base_pip = asset_object.base_pip
    } else if (asset.includes('JPY')) {
        base_pip = 0.01
    }


    let take_profit = open_price + base_pip * take_profit_pip
    if (type == TYPE_SELL) {
        take_profit = open_price - base_pip * take_profit_pip
    }

    return take_profit.toFixed(5)
}

//input: asset, type, open_price, stop_loss_pip
const convert_stop_loss_pip = (asset, type, open_price, stop_loss_pip, price_type = 'forex') => {
    if (!stop_loss_pip) {
        return null
    }

    //lấy base_pip
    const asset_object = OBJECT_PIP_VALUE[asset]
    let base_pip = 0.0001
    if (asset_object) {
        base_pip = asset_object.base_pip
    } else if (asset.includes('JPY')) {
        base_pip = 0.01
    }

    let stop_loss = open_price - base_pip * stop_loss_pip
    if (type == TYPE_SELL) {
        stop_loss = open_price + base_pip * stop_loss_pip
    }

    return stop_loss.toFixed(5)

}

module.exports = {
    get_pip_value,
    get_margin,
    get_net_profit_loss,
    get_balance,
    get_sum_margin_balance,
    check_valid_tp_sl,
    get_fn_net_profit_loss,
    get_transaction_type,
    update_balance,
    get_all_order,
    convert_take_profit_pip,
    convert_stop_loss_pip
}