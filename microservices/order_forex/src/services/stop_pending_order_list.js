const handler_hasura = require('../helpers/handler_hasura')
const { STATUS_PENDING } = require('../../constants/constants');

//Input: id_list,user_id,tournament_id
module.exports = (item) => new Promise(async(resolve, reject) => {
    try {
      const id_list= item.id_list||[]
      let query_id=`_in`
      if(id_list.length==0){
        query_id=`_nin`
      }

      const STOP_PENDING_ORDER = `mutation MyMutation($user_id: uuid, $id_list:[uuid!], $end_time: timestamptz, $updated_at: timestamptz, $status: Int, $tournament_id: uuid) {
        update_demo_history_forex(where: { 
            user_id: {_eq: $user_id}
            status: {_eq: $status}, 
            id: {${query_id}: $id_list},
            tournament_id: {_eq: $tournament_id}
        },
        _set: {
            end_time: $end_time, 
            close_price: 0, 
            swap: 0, 
            gross_profit_loss: 0, 
            net_profit_loss: 0, 
            status: 5, 
            updated_at: $updated_at
        }) 
        {
          returning {
            id
            count_id
            asset
            quantity
            leverage
            type
            dividends
            open_price
            close_price
            start_time
            end_time
            status
            pending_price
            take_profit
            stop_loss
            swap
            gross_profit_loss
            net_profit_loss
            user_id
            user_profile {
              name
            }
            created_at
            updated_at
          }
        }
      }`;

        let variables = {
            id_list,
            user_id: item.user_id,
            end_time: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            status: STATUS_PENDING,
            tournament_id: item.tournament_id
        };
        const result = await handler_hasura(variables, STOP_PENDING_ORDER)
        if (!result.data.update_demo_history_forex.returning[0]) {
            return reject('All order pending not found')
        }
        return resolve(result.data.update_demo_history_forex.returning)
    } catch (err) {
        return reject(err)
    }
})