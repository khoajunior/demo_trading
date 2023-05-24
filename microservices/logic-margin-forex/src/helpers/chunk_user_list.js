const { redis_db } = require('../core/redis_db')
const { CHUNK_USER_LIST, PICE_USER_LIST } = require('../../constants/constants')

module.exports = async(name_spaces) => {
    try {
        var socket_user = {}
        for (var i = 0; i < name_spaces.length; i++) {
            const socket_object = await redis_db.hmgetAsync(name_spaces[i]) || {}
            socket_user = {
                ...socket_user,
                ...socket_object
            }
        }

        var user_list = Object.values(socket_user) || []
        if (user_list.length == 0) {
            return []
        }
        const user_list_set = new Set([...user_list])
        user_list = [...user_list_set]

        const origin_length = user_list.length
        const new_length = Math.floor(origin_length / CHUNK_USER_LIST)

        const start_index = (PICE_USER_LIST - 1) * new_length
        var end_index = PICE_USER_LIST * new_length

        if (PICE_USER_LIST === CHUNK_USER_LIST || end_index > origin_length) {
            end_index = origin_length
        }

        user_list = user_list.slice(start_index, end_index)
        return user_list

    } catch (error) {
        console.log(`error in chunk user list: ` + error)
        return []
    }
}