const { format, utcToZonedTime } = require('date-fns-tz')

module.exports = (time) => {
    const vietNamTimeZone = 'Asia/Ho_Chi_Minh'
    const timeDateUtc = utcToZonedTime(time, vietNamTimeZone)
    if (!time) {
        return ""
    }
    return timeDateUtc.getFullYear() + '/' + (timeDateUtc.getMonth() + 1) + '/' + timeDateUtc.getDate() + ' ' + timeDateUtc.getHours() + ':' + timeDateUtc.getMinutes() + ':' + timeDateUtc.getSeconds()
}
