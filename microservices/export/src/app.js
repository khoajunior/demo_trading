const express = require('express')
const app = express()
const bodyParser = require('body-parser')
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
const { PORT, RABBIT_URL} = require('../constants/constants')
const {router} = require('./router')

const start = async () => {    
    app.use('/', router)

    app.listen(PORT, () => {
        console.log(`service listen on: ${PORT}`)
    })
}

start()