const { SOCKET_PRICE_POLIGON_PASSWORD } = require('../constants/constants')


module.exports = async(socket, next) => {
    try {
        // Bearer token
        console.log("check auth------------")
        const { password } = socket.handshake.auth
        
        // TODO: -> nhớ bật lại check auth
        if (password != SOCKET_PRICE_POLIGON_PASSWORD) {
            const error_message = JSON.stringify({
                status: 403,
                message: 'permission denined',
                data: null,
            })
            return next(new Error(error_message))

        }
        return next()

    } catch (error) {
        console.log(error)
        const error_message = JSON.stringify({
            status: 403,
            message: 'permission denined',
            data: null,
        })
        return next(new Error(error_message))
    }
}