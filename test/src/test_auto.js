const create_forex_order = require('./services/create_forex_order.js')
const close_active_order_list = require('./services/close_active_order_list')
const close_active_order = require('./services/close_active_order')
const close_pending_order = require('./services/close_pending_order')
const close_pending_order_list = require('./services/close_pending_order_list')
const get_order_active_list_forex = require('./services/get_order_list_forex')
const update_active_order = require('./services/update_active_order')
const update_pending_order = require('./services/update_pending_order')
const get_data_for_chart = require('./services/get_data_for_chart')

module.exports = async() => {
    try {
        await get_data_for_chart()
            // await cresate_forex_order()
            // await close_active_order()
            // await close_active_order_list()
            // await get_order_active_list_forex()
            // await close_pending_order()
            // await close_pending_order_list()
            // await update_active_order()
            // await update_pending_order()

    } catch (error) {

    }
}