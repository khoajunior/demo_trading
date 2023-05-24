const trade_binary_pg = require('../services/trade_binary_pg')
const filter_user_tournament_unique = require('../helpers/filter_user_tournament_unique')
const update_demo_account_with_closed_order = require('../services/update_demo_account_with_closed_order')

// because we distance banary and forex in tournament => not update balance to margin level
module.exports = async order_list => {
    console.log(`function stop_binary_pg`)
    try {
        const demo_account_list = []

        for(var i = 0; i < order_list.length; i ++){
            const order = order_list[i]
            const demo_account_id = await trade_binary_pg.stop_order(order)
            if(demo_account_id){
                demo_account_list.push(demo_account_id)
            }
        }

        if(demo_account_list.length > 0) {

            const user_tournament_list = filter_user_tournament_unique(demo_account_list)
            await update_demo_account_with_closed_order(user_tournament_list)

        }
       
    } catch (error) {
        console.log(error)
    }
}
