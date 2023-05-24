const demo_account = require('../services/demo_account')
const { redis_db } = require('../core/redis_db')
const { HANDLE_MARGIN_LEVEL, REALTIME_DEMO_ACCOUNT, USER_PROFILE } = require('../../constants/constants')

module.exports = (margin_item) => new Promise(async (resolve, reject) => {
    try {
        // console.log("handle margin level redis----------")

        const { user_tournament_list: item_list, price_type, check_user_info = false } = margin_item

        for (var i = 0; i < item_list.length; i++) {
            const item = item_list[i]
            const { user_id, tournament_id } = item
            const score = `${tournament_id}/${user_id}`
            const key = `${price_type}_${HANDLE_MARGIN_LEVEL}`


            // get all order with active
            const result = await demo_account.get_order(item)
            var user = null


            //update user info to redis if not have user
            if (check_user_info) {
                const existed_user_redis = await redis_db.hgetAsync(USER_PROFILE, user_id)

                if (!existed_user_redis) {
                    user = await demo_account.get_demo_account(user_id, tournament_id)
                    const {
                        username, email,
                        role, name, avatar, brand_id, phone_number,
                        national_id, front_url_national_id, back_url_national_id, birthday, gender,
                    } = user

                    const user_info = {
                        id: user_id,
                        username,
                        email,
                        role,
                        name,
                        avatar,
                        brand_id,
                        phone_number,
                        national_id,
                        front_url_national_id,
                        back_url_national_id,
                        birthday,
                        gender,
                    }
                    await redis_db.hmsetAsync(USER_PROFILE, user_id, JSON.stringify(user_info))
                }
            }


            if (!result || result.length == 0) {
                try {




                    // await redis_db.hmdelAsync(key, score)
                    const demo_account_key = `${price_type}/${user_id}/${tournament_id}`
                    if (!user) {
                        user = await demo_account.get_demo_account(user_id, tournament_id)
                    }
                    if (!user) {
                        await redis_db.hmdelAsync(key, score)
                        continue
                    }
                    const new_balance = user.balance
                    const sort_deleted_margin_level_json = await redis_db.hgetAsync(key, score)

                    if (sort_deleted_margin_level_json) {
                        const sort_deleted_margin_level = {
                            ...JSON.parse(sort_deleted_margin_level_json),
                            handle_delete_margin: true,
                            total_balance: new_balance,
                        }

                        await redis_db.hmsetAsync(key, score, JSON.stringify(sort_deleted_margin_level))
                    }


                    const user_account_order = {
                        tournament_id,
                        user_id,
                        type: price_type,
                        balance: new_balance,
                        sum_profit_loss: 0,
                        sum_margin: 0,
                        margin_level: null,
                        equity: new_balance,
                        available: new_balance
                    }
                    await redis_db.hmsetAsync(REALTIME_DEMO_ACCOUNT, demo_account_key, JSON.stringify(user_account_order))
                    continue

                } catch (error) {
                    console.log(error)
                }
            }

            const detail = {
                total_balance: result[0].balance,
                total_margin: result[0].total_margin,
                order_list: result
            }

            await redis_db.hmsetAsync(key, score, JSON.stringify(detail))


        }
        return resolve(true)

    } catch (error) {
        console.log(error)
        return resolve(false)
    }
})

