const {CHUNK_ORDER_BINARY_LIST, CHUNK_PICE_ORDER_BINARY} = require('../../constants/constants')

module.exports = (origin_length) => {
  try{
    const new_length = Math.floor(origin_length / CHUNK_ORDER_BINARY_LIST) 

    const start_index = (CHUNK_PICE_ORDER_BINARY - 1) * new_length

    // console.log({CHUNK_PICE_ORDER_BINARY})

    var end_index = CHUNK_PICE_ORDER_BINARY * new_length

    if(CHUNK_PICE_ORDER_BINARY === CHUNK_ORDER_BINARY_LIST || end_index > origin_length){
      end_index = origin_length
    }

    const order_limit = {
      limit: end_index - start_index, 
      offset: start_index
    }

    // console.log({order_limit, end_index, start_index})

    return order_limit
  }catch(error){
    console.log(`error in check order list: ${error}`)
    return {}
  }
}