const convert_month_day_year = (time) =>{
    try{
        let result = time.getDate() + '/' + (time.getMonth() + 1) + '/' + time.getFullYear()

        return result
    }catch(err){
        console.log({err})
        return err
    }
}

const convert_month_year = (time) =>{
    try{
        let result = (time.getMonth() + 1) + '/' + time.getFullYear()

        return result
    }catch(err){
        console.log({err})
        return err
    }
}

module.exports = {
    convert_month_day_year,
    convert_month_year
}