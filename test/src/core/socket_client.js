const io = require('socket.io-client')
const {
    ACCESS_TOKEN,
    SOCKET_URL,
    NAME_SPACE_FOREX,
    NAME_SPACE_FOREX_PENDING,
    NAME_SPACE_FOREX_ACTIVE,
    NAME_SPACE_PRICE_DETAIL,
    EMIT_GET_PRICE
} = require('../../constants/constants')

const socket_client = {
    forex: null,
    forex_sub_1: null,
    forex_sub_2: null,
    forex_sub_3: null,

    active_forex: null,
    active_forex_sub_1: null,
    active_forex_sub_2: null,
    active_forex_sub_3: null,

    pending_forex: null,
    pending_forex_sub_1: null,
    pending_forex_sub_2: null,
    pending_forex_sub_3: null,

    chart: null
}

const connect = () => new Promise(async(resolve, reject) => {
    console.log(`Socket client connect`)
    try {
        // socket_client.forex = await create_socket(NAME_SPACE_FOREX)
        // socket_client.active_forex = await create_socket(NAME_SPACE_FOREX_ACTIVE)
        // socket_client.pending_forex = await create_socket(NAME_SPACE_FOREX_PENDING)

        // //sub 1
        // socket_client.forex_sub_1 = await create_socket(NAME_SPACE_FOREX)
        // socket_client.active_forex_sub_1 = await create_socket(NAME_SPACE_FOREX_ACTIVE)
        // socket_client.pending_forex_sub_1 = await create_socket(NAME_SPACE_FOREX_PENDING)

        // //sub 2
        // socket_client.forex_sub_2 = await create_socket(NAME_SPACE_FOREX)
        // socket_client.active_forex_sub_2 = await create_socket(NAME_SPACE_FOREX_ACTIVE)
        // socket_client.pending_forex_sub_2 = await create_socket(NAME_SPACE_FOREX_PENDING)

        // //sub 3
        // socket_client.forex_sub_3 = await create_socket(NAME_SPACE_FOREX)
        // socket_client.active_forex_sub_3 = await create_socket(NAME_SPACE_FOREX_ACTIVE)
        // socket_client.pending_forex_sub_3 = await create_socket(NAME_SPACE_FOREX_PENDING)

        //Chart-----------------------------------------------
        socket_client.chart = await create_socket(NAME_SPACE_PRICE_DETAIL)

        console.log(`create socket client connect sucess ${SOCKET_URL}`)
        return resolve(true)

    } catch (error) {
        console.log(error)
        return reject(`Error in test -> socket_client -> connect: ` + error.messages)
    }
})

const create_socket = (name_space) => new Promise((resolve, reject) => {
    try {

        const socket = io.connect(`${SOCKET_URL}${name_space}`, {
            // const socket = io.connect(`http://13.212.180.33:5005/price-detail`, {
            reconnect: true,
            auth: {
                token: ACCESS_TOKEN
            },
             transports: ["websocket"]
            // rememberTransport: false, transports: ['WebSocket', 'Flash Socket', 'AJAX long-polling']
        })
        socket.on('connect_error', error => {
            console.log(error.message)
            return reject(error.message)
        })

        return resolve(socket)

    } catch (error) {
        console.log(error)
        return reject(error)
    }

})

module.exports = {
    connect,
    socket_client
}

// const io = require('socket.io-client')
// const create_socket = () => new Promise((resolve, reject) => {
//     try {

//         const socket = io.connect(`http://13.212.180.33:5005/price-detail`, {
//             reconnect: true,
//         })

//         socket.on('get:price', data => {
//             console.log({ data })
//         })

//         socket.on('connect_error', error => {
//             console.log(error.message)
//             return reject(error.message)
//         })

//         return resolve(socket)

//     } catch (error) {
//         console.log(error)
//         return reject(error)
//     }
// })