const handle_hasura = require("../helpers/handler_hasura");

//Lấy danh sách lịch sử thay đổi username của user đứng từ hạng 1 đến hạng: rank, trong tournament: tournament_id
const get_history_username = (item) =>
  new Promise(async (resolve, reject) => {
    try {
      const { tournament_id, rank } = item;

      const GET_HISTORY_USERNAME = `query MyQuery($tournament_id: [uuid!], $rank: Int) {
        history_username_aggregate(where: {user_profile: {demo_accounts: {tournament_id: {_in: $tournament_id}, rank: {_lte: $rank}}}}, order_by: {created_at: desc}) {
          aggregate {
            count
          }
          nodes {
            id
            old_username
            created_at
            updated_at
            user_profile {
              id
              name
              username
              email
              national_id
              demo_accounts(where: {tournament_id: {_in: $tournament_id}}) {
                id
                balance
                rank
                tournament {
                  id
                  name
                }
              }
            }
          }
        }
      }
      `;

      const variables = { tournament_id, rank };

      const response = await handle_hasura(variables, GET_HISTORY_USERNAME);

      let history = response.data.history_username_aggregate.nodes;
      history.sort(function (a, b) {
        return (
          a.user_profile.demo_accounts[0].rank -
          b.user_profile.demo_accounts[0].rank
        );
      });

      return resolve(history);
    } catch (err) {
      console.error(err);
      return reject(err);
    }
  });

module.exports = {
  get_history_username,
};
