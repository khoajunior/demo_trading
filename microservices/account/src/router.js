const express = require('express')
const router = express.Router()

const login_with_password = require('./controllers/login_with_password')
const register = require('./controllers/register')
const { send_email_forgot_password, verify_forgot_password } = require('./controllers/forgot_password')
const reset_password = require('./controllers/reset_password')
const verify_email = require('./controllers/send_verify_email')
const update_user = require('./controllers/update_user_by_admin')
const login_with_jwt = require('./controllers/login_with_jwt')

const join_tournament = require('./controllers/join_tournament')
const leave_tournament = require('./controllers/leave_tournament')
const user_update_username = require('./controllers/update_user_info')
const get_signed_url=require('./controllers/get_signed_url')
const add_session=require('./controllers/add_session')
const check_national_id = require('./controllers/check_national_id')
const {send_voice_otp,verify_otp} = require('./controllers/send_otp')
const delete_user = require('./controllers/delete_user')
const {send_email_admin} = require('./controllers/send_email_for_user')

router.post('/register', register.register_controller)
router.post('/on-board', register.onBoard)
router.post('/login', login_with_password)
router.post('/reset-password', reset_password)
router.post('/send-forgot-email', send_email_forgot_password)
router.post('/verify-forgot-email', verify_forgot_password)
router.post('/send-verify-email', verify_email.send_verify_email)
router.post('/verify-email', verify_email.verify_email)
router.post('/update-user', update_user)
router.post('/login_with_jwt', login_with_jwt)

router.post('/join_tournament', join_tournament)
router.post('/leave_tournament', leave_tournament)
router.post('/get_signed_url_avatar', get_signed_url)
router.post('/user_update_username', user_update_username)
router.post('/get_signed_url', get_signed_url)
router.post('/add_session', add_session)

router.post('/update_national_id', check_national_id)
router.post('/send_otp', send_voice_otp)
router.post('/verify_otp', verify_otp)

router.post('/delete_user', delete_user)
router.post('/send-email-admin', send_email_admin)

module.exports = { router }
