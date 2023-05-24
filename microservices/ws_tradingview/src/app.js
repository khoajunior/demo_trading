const poly_ws = require('./core/poly_ws')
const socket_server = require('./core/socket')
const sentry = require('./core/sentry')
const prod_redis = require('./core/pro_redis_db')
const dev_redis = require('./core/dev_redis_db')
const create_asset = require('./services/create_asset')


const start = async () => {
  prod_redis.connect()

  dev_redis.connect()

  sentry.init()
  
  await create_asset()
  socket_server.connect()

  poly_ws.connect()
}

start()
