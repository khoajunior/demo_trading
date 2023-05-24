const express = require('express')
const router = express.Router()

const create_order_forex = require('../src/controllers/create_order')

router.post('/', create_order_forex)

module.exports = { router }