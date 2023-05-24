const redis = require('redis')
const { promisify } = require('util')
const { REDIS_HOST, REDIS_PORT, REDIS_PASSWORD, MICROSERVICE_NAME } = require('../../constants/constants')
const {Sentry} = require('../core/sentry')

const redis_db = {
    getAsync: null,
    setAsync: null,
    delAsync: null,
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

        const client = redis.createClient(`redis://${REDIS_HOST}:${REDIS_PORT}`, {
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
        redis_db.delAsync = promisify(client.del).bind(client)

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

        console.log(`REDIS: connect to ${REDIS_HOST}:${REDIS_PORT} success`)
        Sentry.captureMessage(`${MICROSERVICE_NAME}:REDIS: connect to ${REDIS_HOST}:${REDIS_PORT} success:  `)

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