const get_tournament_by_id = require("./get_tournament_by_id");
const { OPTION_BINARY_TRADE } = require("../../constants/constants");
const { sort_by_balance, sort_by_equity } = require("./sort_rank_user");

module.exports = (item) =>
  new Promise(async (resolve, reject) => {
    try {
      const { tournament_list } = item;

      const tournament = await get_tournament_by_id(tournament_list);
      let result = [];

      for (var i = 0; i < tournament.length; i++) {
        const item = tournament[i];
        item.tournament_id=item.id
        let data;
        if (item.option_trade === OPTION_BINARY_TRADE) {
          data = await sort_by_balance(item);
          result.push(data.current_user);
        } else {
          data = await sort_by_equity(item);
          result.push(data.current_user);
        }
      }

      return resolve(result);
    } catch (err) {
      console.error(err);
      return reject(
        `Lấy danh sách thứ hạng người chơi trong các giải đấu thất bại`
      );
    }
  });
