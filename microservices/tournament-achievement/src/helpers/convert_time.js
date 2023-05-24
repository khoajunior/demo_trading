module.exports = (time) => {
    let result = new Date(time)
    result = result.getFullYear() + '/' + (result.getMonth() + 1) + '/' + result.getDate() + ' ' + result.getHours() + ':' + result.getMinutes() + ':' + result.getSeconds()

    return result
}