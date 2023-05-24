const {Emitter} = require('@socket.io/redis-emitter')
const {createClient} = require('redis')
const {REDIS_HOST, REDIS_PORT, REDIS_PASSWORD} = require('../../constants/constants')

const socket_emit = {
    io: null
}

const start = () => {
    try{
        const client = createClient(`redis://${REDIS_HOST}:${REDIS_PORT}`, {
            password: REDIS_PASSWORD
        })

        client.on('error', error => {
            console.log(error)
            setTimeout(() => {
                connect()
            }, 10000)
        })

        socket_emit.io = new Emitter(client)

    }catch(error){
        console.log(error)
        setTimeout(() => {
            connect()
        }, 10000)
    }
}

module.exports = {
    start,
    socket_emit
}