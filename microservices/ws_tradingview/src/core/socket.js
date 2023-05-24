const { SOCKET_PRICE_FOREX_PORT, REDIS_HOST, REDIS_PASSWORD, REDIS_PORT } = require('../../constants/constants')
var Server = require("http").createServer()
const socket_connect = require("socket.io")(Server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
        allowedHeaders: ["my-custom-header"],
        credentials: true
    }
});
const redisAdapter = require('socket.io-redis')

const socket = {
    io: null
}

const connect = () => {
    console.log(`function connect`)
    try {
        // console.log({ socket_connect })
        const io = socket_connect
            // console.log({ io })

        io.listen(SOCKET_PRICE_FOREX_PORT)
        console.log(`Socket io listen on port ${SOCKET_PRICE_FOREX_PORT} success`)

        // const adapter = redisAdapter({ host: REDIS_HOST, port: REDIS_PORT, password: REDIS_PASSWORD })
        // io.adapter(adapter)

        socket.io = io

    } catch (error) {
        console.log({ error })
        console.log(`Socket io listen on port ${SOCKET_PRICE_FOREX_PORT} failure`)
    }
}

module.exports = {
    connect,
    socket
}