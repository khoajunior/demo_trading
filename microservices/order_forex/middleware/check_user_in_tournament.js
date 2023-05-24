const get_user_tournament = require('../src/services/get_user_tournament')


module.exports = async(socket, next) => {
    try {
        console.log('check user in tournament')

        const { tournament_id } = socket.handshake.query
        const user_id = socket.request.user.id
        const user_tournament = await get_user_tournament({
            user_id,
            tournament_id
        })

        if(!user_tournament.tournament || !tournament_id){
            const error_message = JSON.stringify({
                status: 404,
                message: "user not in tourament",
                data: null
            })
            return next(new Error(error_message))
        }

        socket.request.tournament = user_tournament.tournament
        return next()
    } catch (error) {
        console.log(error)
        const error_message = JSON.stringify({
            status: 404,
            message: "user not in tourament",
            data: null
        })
        return next(new Error(error_message))
    }
}