const handle_hasura = require("../helpers/handler_hasura");
const add_reward_to_user = require("./add_reward_to_user");
const { sort_by_balance } = require("./sort_rank_user");

//Get achievement by user_id
const get_achivement = (item) =>
  new Promise(async (resolve, reject) => {
    try {
      const { user_id } = item;

      let variables = {
        user_id,
        current_time: new Date().toISOString(),
      };

      const GET_ACHIEVEMENT = `query MyQuery($user_id: uuid!, $current_time: timestamptz) {
        demo_account_aggregate(order_by: {rank: asc}, where: {tournament: {end_time: {_lte: $current_time}, status: {_nin: 2}}, user_id: {_eq: $user_id}}) {
          aggregate {
            count
          }
          nodes {
            id
            rank
            reward {
              id
              name
              value
              picture
            }
            tournament {
              id
              name
              demo_history_binaries_aggregate(where: {user_id: {_eq: $user_id}}) {
                aggregate {
                  count
                }
              }
              demo_history_forexes_aggregate(where: {user_id: {_eq: $user_id}}) {
                aggregate {
                  count
                }
              }
            }
          }
        }
          B1: demo_history_binary_aggregate(where: {user_id: {_eq: $user_id}, tournament: {end_time: {_lte: $current_time}, status: {_nin: 2}}}) {
            aggregate {
              count
            }
          }
          B2: demo_history_binary_aggregate(where: {user_id: {_eq: $user_id}, tournament: {end_time: {_lte: $current_time}, status: {_nin: 2}}, total_profit_loss: {_gt: 0}}) {
            aggregate {
              count
            }
          }
          CFD1: demo_history_forex_aggregate(where: {user_id: {_eq: $user_id}, tournament: {end_time: {_lte: $current_time}, status: {_nin: 2}}}) {
            aggregate {
              count
            }
          }
          CFD2: demo_history_forex_aggregate(where: {user_id: {_eq: $user_id}, tournament: {end_time: {_lte: $current_time}, status: {_nin: 2}}, net_profit_loss: {_gt: 0}}) {
            aggregate {
              count
            }
          }
        }
        `;
      let response = await handle_hasura(variables, GET_ACHIEVEMENT);
      response = response.data;

      //Tính tổng giải thưởng đã nhận và lấy Thông tin các tournament đã tham gia
      let total_reward = 0;
      const tournament_list = [];
      let max_rank = null;

      if (response.demo_account_aggregate.nodes.length > 0) {
        response.demo_account_aggregate.nodes.forEach((account) => {
          //Xử lý tổng giải thưởng
          if (account.reward) {
            const value = parseFloat(account.reward.value);
            total_reward += value;
          }

          //Xử lý thông tin các tournament tham gia
          const tournament = account.tournament;
          tournament.rank = account.rank;
          tournament.count_order = account.tournament.demo_history_binaries_aggregate.aggregate.count + account.tournament.demo_history_forexes_aggregate.aggregate.count;
          tournament.reward = account.reward;
          tournament_list.push(tournament);
        });

        //Thứ hạng cao nhất đạt được
        max_rank = response.demo_account_aggregate.nodes[0].rank;
      }
      //Tính tổng lệnh đã đặt
      let total_order = response.B1.aggregate.count + response.CFD1.aggregate.count;

      //Tính tổng lệnh lời
      let total_order_win = response.B2.aggregate.count + response.CFD2.aggregate.count;

      //Tổng giải tham gia
      const total_tournament = response.demo_account_aggregate.aggregate.count;

      let win_rate = (total_order_win / total_order) * 100;
      if (total_order === 0) {
        win_rate = 0;
      }

      const output = {
        max_rank,
        total_tournament,
        total_reward,
        total_order,
        win_rate,
        tournament_list,
      };
      return resolve(output);
    } catch (err) {
      console.error(err);
      return reject(err);
    }
  });

//Kết thức tournament, xếp hạng rank các user trong đó,gán reward cho user
//Input: tournament_id
//Note: tiêu chí sort: balance
const finish_tournament = (item) =>
  new Promise(async (resolve, reject) => {
    try {
      const { tournament_id } = item;
      // const tournament_id=`1171c5a0-1739-4361-9c2a-a67a72fcc11f`//Merritrade Allstar

      //Xếp hạng user trong giải đấu
      let list_user = [];
      try {
        result_sort = await sort_by_balance({ tournament_id });
        list_user = result_sort.list_user || [];
      } catch (err) {
        console.log(`sort user in tournament err: `, err);
      }

      //update rank các người chơi trong giải đấu
      let sentence_mutation = `mutation MyMutation {`;
      let index = 1;
      for (var i = 0; i < list_user.length; i++) {
        const item = list_user[i];
        const sentence_item = `
            A${index}: update_demo_account(where: {user_id: {_eq: "${item.id}"}, tournament_id: {_eq: "${tournament_id}"}}, _set: {rank: ${index}}) {
              returning {
                id
                user_id
                tournament_id
                rank
              }
            },`;

        sentence_mutation += sentence_item;
        index++;
      }
      sentence_mutation += `
          update_tournament(where: {id: {_eq:"${tournament_id}"}}, _set: {is_finished: true}) {
            returning {
              id
              name
              start_time
              end_time
              is_finished
            }
          }
        }`;

      const result = await handle_hasura(null, sentence_mutation);

      //add reward to user
      if (list_user.length > 0) {
        try {
          await add_reward_to_user({ tournament_id });
        } catch (err) {
          console.error(err);
        }
      }

      return resolve(result);
    } catch (err) {
      console.error(err);
      return reject(`Kết thúc giải đấu thất bại`);
    }
  });

const get_tournament_end = (time) =>
  new Promise(async (resolve, reject) => {
    try {
      const current_time = time || new Date().toISOString();
      const GET_TOURNAMENT_END = `query MyQuery($time: timestamptz) {
          tournament(where: {end_time: {_lte: $time}, is_finished: {_eq: false}}) {
            id
            name
            start_time
            end_time
          }
        }        
        `;

      const variables = {
        time: current_time,
      };

      const result = await handle_hasura(variables, GET_TOURNAMENT_END);

      let list_tournament = [];
      if (result.data.tournament.length > 0) {
        result.data.tournament.forEach((item) => {
          list_tournament.push(item.id);
        });
        return resolve(list_tournament);
      }
      return resolve(true);
    } catch (err) {
      consosle.log({ err });
      return reject(`Lấy những giải đấu hết hạn thất bại`);
    }
  });

module.exports = {
  get_achivement,
  finish_tournament,
  get_tournament_end,
};
