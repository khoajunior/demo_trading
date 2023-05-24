const express = require('express')
const router = express.Router()

const close_active_order_list = require('./controllers/close_active_order_list')
const close_active_order = require('./controllers/close_active_order')
const close_pending_order_list = require('./controllers/close_pending_order_list')
const close_pending_order = require('./controllers/close_pending_order')
const create_forex_order = require('./controllers/create_forex_order')
const get_order_list_forex = require('./controllers/get_order_list_forex')
const update_active_order = require('./controllers/update_active_order')
const update_pending_order = require('./controllers/update_pending_order')

router.post('/close_active_order_list', close_active_order_list)
router.post('/close_active_order', close_active_order)
router.post('/close_pending_order_list', close_pending_order_list)
router.post('/close_pending_order', close_pending_order)
router.post('/create_forex_order', create_forex_order)
router.post('/get_order_list_forex', get_order_list_forex)
router.post('/update_active_order', update_active_order)
router.post('/update_pending_order', update_pending_order)

module.exports = {
    router
}