const socket_server = require('./core/socket')
const add_socket_redis = require('./helpers/add_socket_redis')
const remove_socket_redis = require('./helpers/remove_socket_redis')
const { get_socket_redis, save_socket_redis, get_unique_socket_list } = require('./helpers/get_socket_redis')
const get_all_current_price = require('./helpers/get_all_current_price')
const { save_socket_asset, remove_socket_asset, get_unique_asset_list } = require('./helpers/socket_asset')
const get_pip_margin = require('./services/get_pip_margin')
const handle_pip_margin_realtime = require('./controllers/handle_pip_margin_realtime')
const cron = require('node-cron')
const handle_price_realtime = require('./services/handle_price_realtime')
const get_demo_account_by_user = require('./services/get_demo_account_by_user')

const {
    NAME_SPACE_PRICE_DETAIL,
    TIME_CHECKING_ONLINE,
    EMIT_GET_PRICE,
    EMIT_CURRENT_TIME,
    EMIT_CHART_REALTIME,
    EMIT_PIP_VALUE_AND_MARGIN,
    TIME_PIP_MARGIN_REALTIME,
    EMIT_COUNTER,
    CACHE_SOCKET_COUNTER,
    ASSET_LIST,
    CRYPTO_LIST,
    COMMODITY_LIST,
    STOCK_LIST,
    PRICE_TIME_INTERVAL,
    EMIT_DEMO_ACCOUNT, REALTIME_DEMO_ACCOUNT,
    TURN_ON_SAVE_COUNTER_TIME_TO_REDIS

} = require('../constants/constants')
const { redis_db } = require('./core/redis_db')



module.exports = () => {
    // remove_all_socket_redis()
    var seconds = 60 - new Date().getSeconds()
    var finished_one_minute = new Date()
    var finished_three_minutes = new Date()
    var finished_five_minutes = new Date()
    var finished_ten_minutes = new Date()

    var counter_one_minute = seconds
    var counter_three_minutes = seconds + 2 * 60
    var counter_five_minutes = seconds + 4 * 60
    var counter_ten_minutes = seconds + 9 * 60



    const { io } = socket_server.socket
    const router_chart = io.of(NAME_SPACE_PRICE_DETAIL)

    router_chart.on('connection', async socket => {
        handler_socket(socket)
    })


    cron.schedule('* * * * * *', async () => {
        router_chart.emit(EMIT_CURRENT_TIME, new Date().getTime()) // current_time 1s

        counter_one_minute -= 1
        counter_three_minutes -= 1
        counter_five_minutes -= 1
        counter_ten_minutes -= 1

        router_chart.to(`time/1`).emit(EMIT_COUNTER, { value: counter_one_minute, duration: 1 })

        router_chart.to('time/3').emit(EMIT_COUNTER, { value: counter_three_minutes, duration: 3 })

        router_chart.to('time/5').emit(EMIT_COUNTER, { value: counter_five_minutes, duration: 5 })

        router_chart.to('time/10').emit(EMIT_COUNTER, { value: counter_ten_minutes, duration: 10 })

        
        if(TURN_ON_SAVE_COUNTER_TIME_TO_REDIS == 'true'){
            redis_db.setAsync(CACHE_SOCKET_COUNTER, JSON.stringify({
                counter_one_minute,
                counter_three_minutes,
                counter_five_minutes,
                counter_ten_minutes,
                end_time: {
                    1: finished_one_minute,
                    3: finished_three_minutes,
                    5: finished_five_minutes,
                    10: finished_ten_minutes
                }
            }))
        }
        

        if (counter_one_minute == 0) {
            var seconds = 60 - new Date().getSeconds()
            finished_one_minute = new Date()
            counter_one_minute = seconds
        }

        if (counter_three_minutes == 0) {
            var seconds = 60 - new Date().getSeconds()
            finished_three_minutes = new Date()
            counter_three_minutes = seconds + 2 * 60
        }

        if (counter_five_minutes == 0) {
            var seconds = 60 - new Date().getSeconds()
            finished_five_minutes = new Date()
            counter_five_minutes = seconds + 4 * 60
        }

        if (counter_ten_minutes == 0) {
            var seconds = 60 - new Date().getSeconds()
            finished_ten_minutes = new Date()
            counter_ten_minutes = seconds + 9 * 60
        }

    })


    setInterval(async () => {
        try {
            const unique_asset_list = await get_unique_asset_list()


            for (var i = 0; i < unique_asset_list.length; i++) {
                const stored_asset = unique_asset_list[i]
                var pip_margin = 0
                var price_type = ''

                if (STOCK_LIST.includes(stored_asset)) {
                    price_type = 'stock'
                    pip_margin = await get_pip_margin(stored_asset, price_type)
                    router_chart.to(`asset/${stored_asset}`).emit(EMIT_PIP_VALUE_AND_MARGIN, pip_margin)
                }
                if (ASSET_LIST.includes(stored_asset)) {
                    price_type = 'forex'
                    pip_margin = await get_pip_margin(stored_asset, price_type)
                    router_chart.to(`asset/${stored_asset}`).emit(EMIT_PIP_VALUE_AND_MARGIN, pip_margin)
                } 

                if (CRYPTO_LIST.includes(stored_asset)) {
                    price_type = 'crypto'
                    pip_margin = await get_pip_margin(stored_asset, price_type)
                    router_chart.to(`asset/${stored_asset}`).emit(EMIT_PIP_VALUE_AND_MARGIN, pip_margin)
                }

                if (COMMODITY_LIST.includes(stored_asset)) {
                    price_type = 'commodity'
                    pip_margin = await get_pip_margin(stored_asset, price_type)
                    router_chart.to(`asset/${stored_asset}`).emit(EMIT_PIP_VALUE_AND_MARGIN, pip_margin)
                }

               
            }

        } catch (error) {
            console.log(error)
        }

    }, TIME_PIP_MARGIN_REALTIME)

    // setInterval(async () => {
    //     try {
    //         const unique_socket_list = await get_unique_socket_list()
    //         for (var i = 0; i < unique_socket_list.length; i++) {
    //             const key = unique_socket_list[i]
    //             const data_list = key.split('/')
    //             const type = data_list[0]
    //             const user_id = data_list[1]
    //             const tournament_id = data_list[2]
    //             const result = await get_demo_account_by_user({
    //                 type, user_id, tournament_id
    //             })

    //             router_chart.to(`demo_account/${key}`).emit(EMIT_DEMO_ACCOUNT, result)
    //         }

    //     } catch (error) {
    //         console.log(error)
    //     }
    // }, 1000)

    setInterval(async () => {
        try {
            // key: price_type/user_id/touranemnt_id
            const unique_socket_list = await get_unique_socket_list()
            const realtime_demo_account = await redis_db.hmgetAsync(REALTIME_DEMO_ACCOUNT)
            
            for (var i = 0; i < unique_socket_list.length; i++) {

                try {

                    const key = unique_socket_list[i]

                    //DEMO ACCOUNT WITH ('tournament_id/user_id: demo_account)'
                    // const demo_key = `${tournament_id}/${user_id}`
                    const result_json = realtime_demo_account[key]

                    if(!result_json){
                        continue
                    }
                    const result = JSON.parse(result_json)

                    // console.log({result})
                    router_chart.to(`demo_account/${key}`).emit(EMIT_DEMO_ACCOUNT, result)

                }catch(error){
                    console.log(error)
                }
                
            }

        } catch (error) {
            console.log(error)
        }

    }, 1000)

    handle_price_realtime(router_chart, 'forex')
    handle_price_realtime(router_chart, 'stock')
    handle_price_realtime(router_chart, 'crypto')
    handle_price_realtime(router_chart, 'commodity')
}

const check_socket_online = async (io) => {
    console.log(`check socket online`)
    try {
        const socket_list = await get_socket_redis()
        const current_time = new Date().getTime()


        if (!socket_list) {
            return
        }

        for (var socket_id in socket_list) {
            const joined_time = socket_list[socket_id]

            const expire = (current_time - joined_time) > TIME_CHECKING_ONLINE

            if (!expire) {
                continue
            }

            await remove_socket_redis(socket_id)

        }

    } catch (err) {
        console.log("Err in check socket online", err)
    }
}

const handler_socket = (socket) => {
    try {
        //add socket to redis( online)
        // add_socket_redis(socket.id)

        socket.on(EMIT_CHART_REALTIME, async data => {

            //switch room in socket
            const rooms = [...socket.rooms]
            for (var i = 0; i < rooms.length; i++) {
                const room = rooms[i]
                if (room.includes('asset')) {
                    socket.leave(room)
                }
            }

            const asset_room = data.asset

            socket.join(`asset/${asset_room}`)

            const socket_id = socket.id
            await save_socket_asset(socket_id, asset_room)

            await handle_pip_margin_realtime(socket, asset_room)
        })

        socket.on(EMIT_COUNTER, async data => {
            try {
                const rooms = [...socket.rooms]
                for (var i = 0; i < rooms.length; i++) {
                    const room = rooms[i]

                    if (room.includes('time')) {
                        socket.leave(room)
                    }
                }

                const time_room = data.time
                socket.join(`time/${time_room}`)

            } catch (error) {
                console.log(error)
            }

        })

        socket.on(EMIT_GET_PRICE, async data => {
            try {
                const rooms = [...socket.rooms]
                for (var i = 0; i < rooms.length; i++) {
                    const room = rooms[i]

                    if (room.includes('type')) {
                        socket.leave(room)
                    }
                }

                const type_room = data?.type || 'forex'
                socket.join(`type/${type_room}`)

            } catch (error) {
                console.log(error)
            }

        })


        // realtime demo account
        socket.on(EMIT_DEMO_ACCOUNT, async data => {
            try {
                const rooms = [...socket.rooms]
                for (var i = 0; i < rooms.length; i++) {
                    const room = rooms[i]

                    if (room.includes('demo_account')) {
                        socket.leave(room)
                    }
                }

                const { type, user_id, tournament_id } = data

                if (type && user_id && tournament_id) {
                    const type_room = `${type}/${user_id}/${tournament_id}`
                    socket.join(`demo_account/${type_room}`)
                    const socket_id = socket.id
                    await save_socket_redis(socket_id, type_room)
                }

                const result = await get_demo_account_by_user({
                    type, user_id, tournament_id
                })

                if(result){
                    socket.emit(EMIT_DEMO_ACCOUNT, result)

                }
                

            } catch (error) {
                console.log(error)
            }

        })



        socket.on('disconnect', async reason => {
            console.log("disconnect--------------")

            const socket_id = socket.id
            //emit chart realtime
            await remove_socket_asset(socket_id)

            //emit demo account reatime
            await remove_socket_redis(socket_id)
            //TODO: làm xong nhớ bật cái này lên
        })

        socket.on('error', async err => {
            if (err && err.message === 'unauthorized event') {
                socket.disconnect()
                // remove_socket_redis(socket.id) //TODO: làm xong nhớ bật cái này lên
            }
            console.log({err})
            const socket_id = socket.id
            //emit chart realtime
            await remove_socket_asset(socket_id)

            //emit demo account reatime
            await remove_socket_redis(socket_id)
            //TODO: làm xong nhớ bật cái này lên
        })
    } catch (err) {
        console.log("Err in function handler_socket() in socket_router", err)
    }

}