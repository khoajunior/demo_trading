const stop_active_forex_controller = require('./controllers/stop_active_forex_controller')
const stop_binary_controller = require('./controllers/stop_binary_controller')
const update_pending_to_active_forex_controller = require('./controllers/update_pending_to_active_forex_controller')
const stop_pending_forex_controller = require('./controllers/stop_pending_forex_controller')


module.exports = (routing_key, data) => {
    switch (routing_key) {
        case 'data.pending.forex':
            update_pending_to_active_forex_controller(data)
            break;

        case 'data.active.forex':
            stop_active_forex_controller(data)
            break;

        case 'data.close.pending_list_forex':
            stop_pending_forex_controller(data)
            break;

        case 'data.close.binary':
            // console.log(`close binary ws in handle: `, data)
            stop_binary_controller(data)
            break;

    }
}
