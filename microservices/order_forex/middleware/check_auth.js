const fetch = require('node-fetch')
const { USER_INFO_API_URL } = require('../constants/constants')


module.exports = async(socket, next) => {
    try {
        // Bearer token
        console.log("check auth------------")
        const { token } = socket.handshake.auth

        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: token
            }
        }
        const user_response = await fetch(USER_INFO_API_URL, options)
     

        // TODO: -> nhớ bật lại check auth
        if (user_response.status != 200) {
            const error_message = JSON.stringify({
                status: 403,
                message: 'permission denined',
                data: null,
            })
            return next(new Error(error_message))

        }
        const user = await user_response.json()

        socket.request.user = {
            id: user.sub,
            email: user.email
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