const {
  sort_by_balance,
  sort_by_equity,
} = require("../services/sort_rank_user");
const {
  ROLE_USER,
  TYPE_SORT_BALANCE,
  TYPE_SORT_EQUITY,
  OPTION_BINARY_TRADE,
} = require("../../constants/constants");
const { check_user_in_tournament } = require("../services/tournament");
const get_tournament_by_id=require("../services/get_tournament_by_id")

//req: tournament_id,type_sort
module.exports = async (req, res) => {
  try {
    const session_variables = req.body.session_variables;
    const user_id = session_variables["x-hasura-user-id"];
    const user_role = session_variables["x-hasura-role"];
    // const user_id = `4a0d7e30-182f-4868-8eea-994a08c42a48` //trader
    // const user_id = `3fcf1625-139b-4daa-a1f1-302e56b52969` //admin

    const item = req.body.input;
    // const item = req.body
    item.user_id = user_id;

    const { tournament_id } = item;
    const type_sort = item.type_sort || TYPE_SORT_EQUITY;

    //Kiểm tra user có tham gia tournament hay không
    item.role = user_role;
    let tournament;
    if (user_role == ROLE_USER) {
      const response = await check_user_in_tournament({
        user_id,
        tournament_id,
      });
      tournament = response.tournament;
    }else{
      response_tournament=await get_tournament_by_id(tournament_id)
      tournament=response_tournament[0]
    }

    let result;
    const time = new Date().toISOString();
    const check_tournament_open = time < tournament.end_time;
    if (
      !check_tournament_open ||
      tournament.option_trade === OPTION_BINARY_TRADE ||
      type_sort === TYPE_SORT_BALANCE
    ) {
      result = await sort_by_balance(item);
    } else {
      result = await sort_by_equity(item);
    }

    return res.json({ status: 200, message: "Handle success", data: result });
  } catch (err) {
    return res.status(400).json({
      code: `handle_fail`,
      message: `${err}`,
    });
  }
};
