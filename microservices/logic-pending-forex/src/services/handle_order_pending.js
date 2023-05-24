// const { TYPE_BUY, EXCHANGE_LOGIC_SERVICE, PRICE_TYPE } = require('../../constants/constants')
// const message_broker = require('../core/message_broker')

// //purpose: handle order which status=2
// //input: item:{id,open_price,pending_price,type} format_data:{ask,bid}
// module.exports = (item, format_data) => new Promise(async(resolve, reject) => {
//     // console.log(`Handle pending order: ${item.id}`)
//     try {
//         // console.log("hander order pending")
//         const { id, open_price, pending_price, type, user_id, tournament_id } = item
//         const { ask, bid } = format_data

//         let variable;
//         if (type === TYPE_BUY) { //type: buy order
//             //Case 1: pending price <= open price 
//             // buy limit
//             if (open_price >= pending_price) {

//                 if (pending_price >= ask) {
//                     console.log("buy limit")
//                     console.log(`type = buy && open_price: ${open_price} >= pending_price: ${pending_price} && pending_price: ${pending_price} >= ask: ${ask}`)
//                     variable = update_active({
//                         id, 
//                         open_price: ask,
//                         user_id,
//                         tournament_id 
//                     })
//                     return resolve(variable)
//                 }
//             }
//             //Case 2: pending price > open price
//             // buy stop
//             else {
//                 if (pending_price < ask) {
//                     console.log("buy stop")
//                     console.log(`type = buy && open_price: ${open_price} < pending_price: ${pending_price} && pending_price: ${pending_price} <= ask: ${ask}`)
//                     variable = update_active({
//                         id, 
//                         open_price: ask,
//                         user_id,
//                         tournament_id 
//                     })
//                     return resolve(variable)
//                 }
//             }
//         } else { //type: sell order
//             //Case 1: pending price <= open price
//             // sell stop
//             if (open_price >= pending_price) {
//                 if (pending_price >= bid) {
//                     console.log("sell stop")
//                     console.log(`type = sell && open_price: ${open_price} >= pending_price: ${pending_price} && pending_price: ${pending_price} >= bid: ${bid}`)
//                     variable = update_active({
//                         id, 
//                         open_price: bid,
//                         user_id,
//                         tournament_id 
//                     })
//                     return resolve(variable)
//                 }
//             }
//             //Case 2: pending_price > open_price
//             //sell limit
//             else {
//                 if (pending_price < bid) {
//                     console.log("sell limit")
//                     console.log(`type = sell && open_price: ${open_price} < pending_price: ${pending_price} && pending_price: ${pending_price} <= bid: ${bid}`)
//                     variable = update_active({
//                         id, 
//                         open_price: bid,
//                         user_id,
//                         tournament_id 
//                     })
//                     return resolve(variable)
//                 }
//             }
//         }
//     } catch (err) {
//         return reject(err)
//     }
// })

// const update_active = (data) => {
//     const pubChannel = message_broker.getPublishChannel()

//     const format_data = JSON.stringify(data);
//     console.log({ format_data })
//     pubChannel.publish(
//         EXCHANGE_LOGIC_SERVICE,
//         'data.pending.forex',
//         Buffer.from(format_data)
//     )
//     return data
// }