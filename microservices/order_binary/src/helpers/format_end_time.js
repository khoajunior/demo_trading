
const get_finished_time = require('./get_finshed_time')
module.exports =  async (add_minutes = 1) => {

    const finished_time_str = await get_finished_time(add_minutes)
    var finished_time = new Date(finished_time_str)

    const minutes = finished_time.getMinutes()
    const seconds = finished_time.getSeconds()
    
    const end_time = new Date(finished_time.setMinutes(minutes + add_minutes))

    const time_format = new Date(end_time.setSeconds(0)).setMilliseconds(0)
    const end_time_str = new Date(time_format).toISOString()
    return end_time_str
}