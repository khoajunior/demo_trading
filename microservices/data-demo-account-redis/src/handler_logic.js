const handle_margin_forex_order_to_redis = require('./controllers/handle_margin_forex_order_to_redis')
const { REDIS_CREATE_ORDER, REDIS_UPDATE_ORDER } = require('../constants/constants')
const add_update_pending_active_order = require('./controllers/add_update_pendind_active_to_redis')
const remove_pending_active_order = require("./controllers/remove_pending_active_from_redis")
const remove_margin_from_redis = require('./controllers/remove_margin_from_redis')
const filter_user_tournament_unique = require('./helpers/filter_user_tournament_unique')
const handle_margin = require('./services/handler_margin')


module.exports = async (routing_key, data) => {
    console.log({ routing_key })
    switch (routing_key) {

        case 'data.handling-margin.order':
            await handle_margin_forex_order_to_redis(data)
            break;

        case 'data.handling-margin.removing':
            await remove_margin_from_redis(data)
            break;

        case 'data.pending-active-order.adding':
            await add_update_pending_active_order(data, false, REDIS_CREATE_ORDER)
            break

        // postgres send to redis
        // update pending to active sneed to remove pending and add active order to redis
        // because pending change to active => data has STATUS_ACTIVE > remove pending need has_orverride_status = true 
        case 'data.pending-change-to-active.order':
            await remove_pending_active_order(data, true)
            await add_update_pending_active_order(data, true, REDIS_CREATE_ORDER)
            break

        // update need to remove old and create new
        case 'data.pending-active-order.updating':
            await remove_pending_active_order({
                order_list: data.pre_order_list,
                price_type: data.price_type
            })
            await add_update_pending_active_order({
                order_list: data.updated_order_list,
                price_type: data.price_type

            }, false, REDIS_CREATE_ORDER)
            break

        case 'data.pending-active-order.removing':
            await remove_pending_active_order(data)
            break

        // remove pending_active_order
        // remove_margin_from_redis
        case 'data.delete-tournament.handler':
            await remove_pending_active_order(data)

            const unique_tournament_user_list = filter_user_tournament_unique(data)

            if (unique_tournament_user_list.length > 0) {
                await remove_margin_from_redis({
                    user_tournament_list: unique_tournament_user_list,
                    price_type: data.price_type
                })
            }
            break

    }
}