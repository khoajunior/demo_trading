const handler_hasura = require('../helpers/handler_hasura')
const { STATUS_ACTIVE, STATUS_PENDING, MINIMUM_AMOUNT_ASSET, REALTIME_DEMO_ACCOUNT, REDIS_HOST, REDIS_PORT } = require('../../constants/constants')
const {
    get_margin,
    check_valid_tp_sl,
    get_fn_net_profit_loss,
    get_transaction_type,
    convert_take_profit_pip,
    convert_stop_loss_pip
} = require('./support_handler')
const get_demo_account_by_user = require('./get_demo_account_by_user')
const { redis_db } = require('../core/redis_db')

const CREATE_ORDER = `mutation MyMutation($start_time: timestamptz, $asset: String, $quantity: float8, $leverage: float8, $take_profit: float8, $stop_loss: float8, $pending_price: float8, $status: Int!, $open_price: float8, $type: Int, $user_id: uuid, $margin: float8, $transaction_type: Int, $fn_net_profit_loss: float8, $tournament_id: uuid,$ip: String) {
    insert_demo_history_forex(objects: {start_time: $start_time, asset: $asset, quantity: $quantity, type: $type, leverage: $leverage, open_price: $open_price, take_profit: $take_profit, stop_loss: $stop_loss, status: $status, pending_price: $pending_price, user_id: $user_id, margin: $margin, transaction_type: $transaction_type, fn_net_profit_loss: $fn_net_profit_loss, tournament_id: $tournament_id, IP: $ip}) {
      returning {
        id
        IP
        asset
        quantity
        leverage
        margin
        type
        transaction_type
        dividends
        open_price
        close_price
        start_time
        end_time
        status
        pending_price
        take_profit
        stop_loss
        swap
        gross_profit_loss
        net_profit_loss
        fn_net_profit_loss
        user_id
        count_id
        user_profile {
          name
        }
        tournament_id
        tournament {
          updated_at
          start_time
          organizer
          name
          end_time
          id
          created_at
        }
        created_at
        updated_at
      }
    }
  }
  
  `

//Input: tournament_id,asset,type,quantity,leverage,take_profit,stop_loss,pending_price,leverage,open_price,take_profit_pip,stop_loss_pip
module.exports = (item) => new Promise(async (resolve, reject) => {
    try {
        var tournament_id = item.tournament_id
        var start_time = new Date().toISOString()
        var asset = item.asset || null
        var quantity = item.quantity || null //solot
        var leverage = item.leverage || 1 // donbay
        var open_price = item.open_price || null
        var take_profit = item.take_profit || null
        var stop_loss = item.stop_loss || null
        var take_profit_pip = item.take_profit_pip || null
        var stop_loss_pip = item.stop_loss_pip | null
        var type = item.type || 1 //1: buy, 2:sell 
        var pending_price = item.pending_price || null
        var user_id = item.user_id || null
        var status = STATUS_ACTIVE //2: pending, 3: active, 4: close, 5: cancel
        const ip = item.ip || null

        var transaction_type = null
        var fn_net_profit_loss = null

        const price_type = item.price_type || 'forex'

        //Kiểm tra quantity so với khối lượng lệnh cho phép nhỏ nhất của asset
        if (MINIMUM_AMOUNT_ASSET[asset] && quantity < MINIMUM_AMOUNT_ASSET[asset]) {
            return reject(`Khối lượng lệnh tối thiểu của ${asset}: ${MINIMUM_AMOUNT_ASSET[asset]}`)
        }


        if (pending_price) {
            status = STATUS_PENDING
            start_time = null
            fn_net_profit_loss = 0

            transaction_type = get_transaction_type(pending_price, open_price, type)

            //handle take_profit and stop_loss
            //convert pip to price          
            take_profit = convert_take_profit_pip(asset, type, pending_price, take_profit_pip, price_type)
            stop_loss = convert_stop_loss_pip(asset, type, pending_price, stop_loss_pip, price_type)
            await check_valid_tp_sl(stop_loss, take_profit, pending_price, type, asset, price_type)
            var margin = null
        } else {
            fn_net_profit_loss = await get_fn_net_profit_loss(open_price, quantity, type, asset, price_type)

            //handle take_profit and stop_loss
            //convert pip to price
            take_profit = convert_take_profit_pip(asset, type, open_price, take_profit_pip, price_type)
            stop_loss = convert_stop_loss_pip(asset, type, open_price, stop_loss_pip, price_type)
            await check_valid_tp_sl(stop_loss, take_profit, open_price, type, asset, price_type)


            var margin = await get_margin(quantity, leverage, asset, price_type)
        }

        //NOTE: chỉnh sửa lấy theo redis,LƯU Ý Ở ĐÂY
        const key_find = `${price_type}/${user_id}/${tournament_id}`
        let user_demo_account = await redis_db.hgetAsync(REALTIME_DEMO_ACCOUNT, key_find)
        try {
            user_demo_account = JSON.parse(user_demo_account)
        } catch (err) {
            console.log(`Cannot JSON.parse(user_demo_account), `, err)
        }
        if (!user_demo_account) {
            user_demo_account = await get_demo_account_by_user({ user_id, tournament_id, type: price_type })
        }
        const { available } = user_demo_account

        // TODO check test margin level 
        const check_margin = available - margin
        if (check_margin < 0 && !pending_price) {
            //only check total margin with action order
            console.log(`available:${available} < margin:${margin}`)
            return reject(`Số dư không đủ cho ký quỹ (margin)`)
        }

        let variables = {
            start_time: start_time,
            asset: asset,
            quantity: quantity,
            leverage: leverage,
            take_profit: take_profit,
            stop_loss: stop_loss,
            pending_price: pending_price,
            status: status,
            open_price: open_price,
            type: type,
            user_id: user_id,
            transaction_type,
            fn_net_profit_loss,
            margin,
            tournament_id: item.tournament_id,
            ip
        };

        const result = await handler_hasura(variables, CREATE_ORDER)

        return resolve(result.data.insert_demo_history_forex.returning[0])
    } catch (err) {
        console.error(err)
        return reject(err)
    }
})