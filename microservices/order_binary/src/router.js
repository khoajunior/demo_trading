const express = require('express')
const router = express.Router()

const create_binary_order = require('./controllers/create_binary_order')
const close_binary_order = require('./controllers/close_binary')

router.post('/create_binary_order', create_binary_order)
router.post('/close_binary_order', close_binary_order)

module.exports = {
    router
}