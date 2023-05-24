const {CHUNK_TIME_SCHEDULE_LIST, CHUNK_PICE_TIME_SCHEDULE} = require('../../constants/constants')
const SECONDS = 60


module.exports = () => {
  const list_time = []
  if (CHUNK_TIME_SCHEDULE_LIST) {
    for (var i = 0; i <= SECONDS  / CHUNK_TIME_SCHEDULE_LIST; i++) {
      const data = i * CHUNK_TIME_SCHEDULE_LIST + (CHUNK_PICE_TIME_SCHEDULE - 1)
      if (data >= 60) {
        break
      }
      list_time.push(data.toString())
    }

    const time_schedule = list_time.join(',') + ' * * * * *'
    return time_schedule
  }
  return '* * * * * *'
}

