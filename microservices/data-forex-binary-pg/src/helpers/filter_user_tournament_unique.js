module.exports = (item_list) => {
    try{
        if(item_list.length == 0){
            return []
        }
        const value_list = item_list.map(item => item.tournament_id + '/' + item.user_id)
        const item_set = new Set(value_list)
        
        const format_data = [...item_set].map(element => {
            const object_list = element.split('/')
            return {
                tournament_id: object_list[0],
                user_id: object_list[1]
            }
        })
        return format_data
    }catch(error){
        return []
    }
}