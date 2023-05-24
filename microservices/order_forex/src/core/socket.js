const {SOCKET_PORT, REDIS_HOST, REDIS_PASSWORD, REDIS_PORT} = require('../../constants/constants')
const socket_connect = require('socket.io')
const redisAdapter = require('socket.io-redis')

const socket = {
    io: null
}

const connect = () => {
    try{
        const io = socket_connect()

        io.listen(SOCKET_PORT)
        console.log(`Socket io listen on port ${SOCKET_PORT} success`)

        const adapter = redisAdapter({host: REDIS_HOST, port: REDIS_PORT, password: REDIS_PASSWORD})
        io.adapter(adapter)
        
        socket.io = io

    }catch(error){
        console.log(`Socket io listen on port ${SOCKET_PORT} failure`)
    }
}

module.exports = {
    connect,
    socket
}