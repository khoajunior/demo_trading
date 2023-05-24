const WebSocket = require('ws')
const {TRADERMADE_CURRENCY_LIST, TRADERMADE_STREAMING_KEY, TRADERMADE_RECONECTION_INTERVAL, TRADERMADE_WS_URL} = require('../../constants/constants')

const trademade = {
    ws: null
}

const reconnect = () => {
    console.log("trademade")
    const ws = new WebSocket(TRADERMADE_WS_URL)
    var reconnectInterval = TRADERMADE_RECONECTION_INTERVAL

    ws.on('open', function open() {
        console.log('open')
        const info = JSON.stringify({
            userKey: TRADERMADE_STREAMING_KEY,
            symbol: TRADERMADE_CURRENCY_LIST.join(', ')
        })
        ws.send(info)
        trademade.ws = ws

        console.log("conected to trademade")

    })
    ws.on('close', function() {
        console.log('socket close: will reconnect in ' + reconnectInterval)
        setTimeout(reconnect, reconnectInterval)
    })
}

module.exports = {
   reconnect,
   trademade
}
