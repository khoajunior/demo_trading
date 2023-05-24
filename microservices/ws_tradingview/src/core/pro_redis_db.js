const redis = require('redis')
const { promisify } = require('util')
const { REDIS_HOST, REDIS_PORT, REDIS_PASSWORD, MICROSERVICE_NAME, PRO_REDIS_URL} = require('../../constants/constants')
const {Sentry} = require('./sentry')

const redis_db = {
    getAsync: null,
    setAsync: null,
    client: null,
    hmsetAsync: null,
    hmgetAsync: null,
    hmdelAsync: null,
    zaddAsync: null,
    zremAsync: null, // delete
    zscoreAsync: null,
    zscanAsync: null,
    zrangebyscoreAsync: null

}

const connect = () => {
    try {

        const client = redis.createClient(PRO_REDIS_URL, {
            password: REDIS_PASSWORD
        })
        client.on('error', error => {
            console.error(error)
            Sentry.captureException(error)
            setTimeout(() => {
                connect()
            }, 10000)
        })

        redis_db.client = client
        redis_db.getAsync = promisify(client.get).bind(client)
        redis_db.setAsync = promisify(client.set).bind(client)
        redis_db.hmsetAsync = promisify(client.hmset).bind(client)
        redis_db.hmgetAsync = promisify(client.hgetall).bind(client)
        redis_db.hmdelAsync = promisify(client.hdel).bind(client)

        redis_db.zaddAsync = promisify(client.zadd).bind(client)
        redis_db.zremAsync = promisify(client.zrem).bind(client) // delete
        redis_db.zscoreAsync = promisify(client.zscore).bind(client)
        redis_db.zscanAsync = promisify(client.zscan).bind(client)
        redis_db.zrangebyscoreAsync = promisify(client.zrangebyscore).bind(client)

        // TODO TEST delete cache
        // client.flushdb(function (err, succeeded) {
        //     console.log(succeeded); // will be true if successfull
        // });

        console.log(`REDIS: connect to ${PRO_REDIS_URL} success`)
        Sentry.captureMessage(`${MICROSERVICE_NAME}:REDIS: connect to url success:  `)

    } catch (error) {
        console.log(error)
        Sentry.captureException(error)
        setTimeout(() => {
            connect()
        }, 10000)
    }

}

module.exports = {
    redis_db,
    connect
}