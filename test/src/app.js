const express = require('express')
const app = express()
const bodyParser = require('body-parser')
app.use(bodyParser.json())

const { router } = require('./router')

const socket_client = require('./core/socket_client')
const test_auto = require('./test_auto')


const start = async() => {

    await socket_client.connect() // tạo các connect tới các channel socket( giống router)
    await test_auto() //chạy auto script test

}

start()