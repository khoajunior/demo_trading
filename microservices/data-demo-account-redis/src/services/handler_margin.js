const { redis_db } = require('../core/redis_db')
const { HANDLE_MARGIN_LEVEL } = require('../../constants/constants')

const remove_order = (margin_item) => new Promise(async (resolve, reject) => {
  try {

    const {
      user_tournament_list: unique_tournament_user_list,
      price_type, handle_leave_tournament = false
    } = margin_item

    for (var i = 0; i < unique_tournament_user_list.length; i++) {
      const { tournament_id, user_id } = unique_tournament_user_list[i]

      const score = `${tournament_id}/${user_id}`
      const key = `${price_type}_${HANDLE_MARGIN_LEVEL}`

      //remove handling margin from redis

      if (handle_leave_tournament) {

        const sort_deleted_margin_level_json = await redis_db.hgetAsync(key, score)

        if (sort_deleted_margin_level_json) {
          const sort_deleted_margin_level = {
            ...JSON.parse(sort_deleted_margin_level_json),
            handle_leave_tournament: true
          }

          await redis_db.hmsetAsync(key, score, JSON.stringify(sort_deleted_margin_level))
        }

      } else {
        await redis_db.hmdelAsync(key, score)
      }
    }
    return resolve('remove order handling margin from redis success')

  } catch (error) {
    console.log(error)
    return reject(error)
  }

})

module.exports = {
  remove_order
}
