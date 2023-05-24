module.exports = (item_list, price_type) => {
  try{
      if(item_list.length == 0){
          return []
      }
      const value_list = item_list.map(item => item.tournament_id + '/' + item.user_id)
      const item_set = new Set(value_list)
      
      const format_key = [...item_set].map(element => {
          const object_list = element.split('/')
         
          const tournament_id = object_list[0]
          const user_id = object_list[1]
          
          const key = `${price_type}/${user_id}/${tournament_id}`
          return key
      })
      return format_key
  }catch(error){
      return []
  }
}