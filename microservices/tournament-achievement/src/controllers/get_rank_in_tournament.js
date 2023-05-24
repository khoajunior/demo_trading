const get_rank_in_tournament = require("../services/get_rank_in_tournament");
const { ROLE_USER } = require("../../constants/constants");

//req: tournament_list
module.exports = async (req, res) => {
  try {
    const session_variables = req.body.session_variables;
    const user_id = session_variables["x-hasura-user-id"];
    const user_role = session_variables["x-hasura-role"];

    const item = req.body.input;
    item.user_id = user_id;
    item.role = user_role;

    if (user_role != ROLE_USER) {
      return res.status(400).json({
        code: `wrong_role`,
        message: `Không thể lấy xếp hạng của người chơi`,
      });
    }

    const result = await get_rank_in_tournament(item);
    return res.json({ status: 200, message: "Handle success", data: result });
  } catch (err) {
    console.error(err);
    return res.status(400).json({
      code: `handle_fail`,
      message: `${err}`,
    });
  }
};
