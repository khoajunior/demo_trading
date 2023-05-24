const postgres = require('../core/postgres')

module.exports = async (user_tournament_list) => {
  try{

      const query_promise = user_tournament_list.map(item => {
          
          const variables = [
              new Date().toISOString(),
              item.user_id,
              item.tournament_id
          ]
          const sql = `UPDATE demo_account 
              set updated_at = $1, closed_order_at = $1  
              where user_id = $2 and tournament_id = $3 
          `
  
          return postgres.pool.query(sql, variables)
      })

      await Promise.all(query_promise)
      

  }catch(error){
      console.log(error)
      return reject(error)
  }

}