const postgres = require('./core/postgres')
const {PORT}=require('../constants/constants')
var express = require('express');
var app = express();
const bodyParser = require('body-parser')
app.use(bodyParser.json())
const dashboard = require('./router')

const start = async () => {
    try {
        await postgres.connect()

        //app
        app.use('/', dashboard.router)

        app.listen(PORT, () => {
            console.log(`App listen at: ${PORT}`)
        })

    } catch (error) {
        console.log(error)
    }
}

start()