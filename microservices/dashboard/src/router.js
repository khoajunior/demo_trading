const express = require('express')
const router = express.Router()

const chart_user_per_day=require('./controllers/chart_user_per_day')
const chart_tournament_per_month=require('./controllers/chart_tournament_per_month')

router.post('/chart_user_per_day', chart_user_per_day)
router.post('/chart_tournament_per_month', chart_tournament_per_month)

module.exports = {
    router
}