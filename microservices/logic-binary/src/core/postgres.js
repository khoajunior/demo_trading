const {Pool} = require('pg')
const {POSTGRES_URL} = require('../../constants/constants')

const db = {
    pool: null,
    connect: null
}

db.connect = async () => new Promise((resolve, reject) => {
    try{
        const pool = new Pool({
            connectionString: POSTGRES_URL
        })
        console.log(`DATABASE POSTGRES: connect success to ${POSTGRES_URL}`)

        db.pool = pool
        return resolve(true)

    }catch(error){
        console.log(error)
        return reject(error)

    }
})

module.exports = db