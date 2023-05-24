const { socket_client } = require('../core/socket_client')
const { EMIT_GET_PRICE, EMIT_CHART_REALTIME, EMIT_PIP_VALUE_AND_MARGIN, EMIT_COUNTER, EMIT_DEMO_ACCOUNT} = require('../../constants/constants')
// const { v4: uuid } = require(uuid)

module. exports = (item = null) => new Promise((resolve, reject) => {
    try {

        const socket_chart = socket_client.chart

        const result = {}
   

        // socket_chart.emit(EMIT_CHART_REALTIME, {asset: 'EUR/USD'})

        // socket_chart.emit(EMIT_COUNTER, {   time: 1})
        // socket_chart.on(EMIT_COUNTER, data => {
        //     console.log({time: data})
        // })


        // socket_chart.emit(EMIT_GET_PRICE, {type: 'forex'})
        // socket_chart.on(EMIT_GET_PRICE, data => {
        //     console.log({ data1: data})
        //     result[EMIT_GET_PRICE] = data
        // })

        // socket_chart.on(EMIT_CHART_REALTIME, price_detail => { 
        //     console.log({price_detail})
        // })

        // socket_chart.on(EMIT_PIP_VALUE_AND_MARGIN, message => {
        //     console.log({"pip_value----------":message})
        // })

        socket_chart.emit(EMIT_DEMO_ACCOUNT, {
            type: 'forex', 
            tournament_id: '77175e37-f8fa-460b-a6b2-cbc898d3f15b',
            user_id: 'b907bec6-9c28-4795-b9c0-69ba54820b80'
        })
        

        socket_chart.on('reload_order_pending', (reload_data) => {
            console.log({reload_data})
        })
       
        socket_chart.on('reload_order_active', (reload_data_active) => {
            console.log({reload_data_active})
        })

        socket_chart.on('reload_order_pending_cancel', (reload_order_pending_cancel) => {
            console.log({reload_order_pending_cancel})
        })

        // socket_chart.on(EMIT_DEMO_ACCOUNT, data23 => {
        //     console.log({ data23 })
        // })

        
        return resolve(result)

    } catch (error) {
        console.log({error})
        return reject(error)
    }
})