const {
    REALTIME_DEMO_ACCOUNT,
    STATUS_CLOSE,
    DEFAULT_BINARY_TOURNAMENT_ID,
    DEFAULT_FOREX_TOURNAMENT_ID,
    OPTION_BINARY_TRADE,
    STATUS_CANCEL,
    ROLE_USER,
    USER_PROFILE
} = require("../../constants/constants");
const handle_hasura = require("../helpers/handler_hasura");
const { redis_db } = require("../core/redis_db");


const GET_USER_BY_PERFORMANCE = `query MyQuery($start_time: timestamptz, $end_time: timestamptz, $status_forex: [Int!]) {
    user_profile {
      id
      name
      demo_history_binaries_aggregate(where: {created_at: {_gte: $start_time, _lte: $end_time}, is_checked: {_eq: true}}) {
        aggregate {
          count
          sum {
            total_profit_loss
          }
        }
      }
      demo_history_forexes_aggregate(where: {created_at: {_gte: $start_time, _lte: $end_time}, status: {_in: $status_forex}}) {
        aggregate {
          count
          sum {
            net_profit_loss
          }
        }
      }
    }
  }
  `;
const INSERT_USER_PERFORMANCE = `mutation MyMutation($objects: [user_performance_insert_input!]!) {
  insert_user_performance(objects: $objects) {
    returning {
      id
      user_id
      total_order
      total_profit
      month
      year
      rank
    }
  }
}`;



//xếp hạng rank các user theo performance trong tháng
const sort_user_by_performance = () =>
    new Promise(async (resolve, reject) => {
        try {
            //set start_time and end_time from current Date
            const current_month = new Date().getMonth() + 1;
            let year = new Date().getFullYear();

            const end_time = new Date(`${year}-${current_month}-01`);
            end_time.setHours(0, 0, 0, 0);

            let previous_month = current_month - 1;
            if (current_month == 1) {
                previous_month = 12;
                year -= 1;
            }
            const start_time = new Date(`${year}-${previous_month}-01`);
            start_time.setHours(0, 0, 0, 0);

            //Lấy user_info: số order đặt, tổng lời/lỗ của user trong 1 tháng
            let variables = {
                start_time,
                end_time,
                status_forex: [STATUS_CLOSE, STATUS_CANCEL],
            };
            let user_info = await handle_hasura(variables, GET_USER_BY_PERFORMANCE);
            user_info = user_info.data.user_profile;

            let array_user = [];
            user_info.map((item) => {
                const total_order = item.demo_history_binaries_aggregate.aggregate.count + item.demo_history_forexes_aggregate.aggregate.count;
                if (total_order > 0) {
                    const user = {
                        user_id: item.id,
                        total_order,
                        total_profit: item.demo_history_binaries_aggregate.aggregate.sum.total_profit_loss + item.demo_history_forexes_aggregate.aggregate.sum.net_profit_loss,
                        month: previous_month,
                        year,
                    };
                    array_user.push(user);
                }
            });

            //Sort mảng array_user ở trên
            array_user.sort(function (a, b) {
                if (a.total_profit != b.total_profit) {
                    return b.total_profit - a.total_profit; //Trong trường hợp total_profit khác nhau,sort từ cao đến thấp
                } else {
                    return a.total_order - b.total_order; //Trong trường hợp total_profit bằng nhau,sort theo số order từ thấp đến cao
                }
            });

            //Thêm rank vào array_user
            let rank = 1;
            array_user.forEach((user) => {
                user.rank = rank;
                rank += 1;
            });

            //insert into table user_performance
            variables = {
                objects: array_user,
            };

            const result = await handle_hasura(variables, INSERT_USER_PERFORMANCE);

            return resolve(result.data.insert_user_performance);
        } catch (err) {
            console.error(err);
            return reject(`Xếp hạng người chơi theo tháng không thành công`);
        }
    });

//Xếp hạng các user trong tournament theo balance
const sort_by_balance = (item) =>
  new Promise(async (resolve, reject) => {
    try {
      const { tournament_id, user_id, limit } = item;
      const role = item.role || ``;
      const offset = item.offset || 0;

      const SORT_BY_BALANCE = `query MyQuery($tournament_id: uuid!,$user_hack: [String!]) {
        demo_account(where: {tournament_id: {_eq: $tournament_id}, user_profile: {username: {_nin: $user_hack}}}, order_by: {balance: desc}) {
          id
          balance
          rank
          tournament {
            id
            name
          }
          user_profile {
            avatar
            email
            id
            name
            national_id
            phone_number
            username
            demo_accounts(where: {tournament_id: {_eq: $tournament_id}}) {
              id
              reward {
                id
                name
                level
                amount
                picture
                value
              }
            }
          }
        }
      }`;

      const user_hack=[]
      let response = await handle_hasura({ tournament_id,user_hack }, SORT_BY_BALANCE);
      let list_user = [];

      if (response.data.demo_account.length == 0) {
        return reject(`Giải đấu chưa có người chơi.`);
      }
      response.data.demo_account.forEach((demo_account) => {
        const data = demo_account.user_profile;
        data.tournament = demo_account.tournament;
        data.balance = demo_account.balance;
        data.amount = demo_account.balance;

        if (data.demo_accounts[0].reward) {
          data.reward = data.demo_accounts[0].reward;
        } else {
          data.reward = null;
        }
        list_user.push(data);
      });

      const total_users = list_user.length;

      //Lấy vị trí rank của user request
      let current_user = {};
      if (role === ROLE_USER) {
        for (var i = 0; i < list_user.length; i++) {
          if (list_user[i].id === user_id) {
            current_user = list_user[i];
            current_user.user_rank = i + 1;
          }
        }
      }

      //Phân trang
      if (!limit) {
        list_user = list_user.slice(offset);
      } else {
        list_user = list_user.slice(offset, offset+limit);
      }

      return resolve({ list_user, current_user, total_users });
    } catch (err) {
      console.error(err);
      return reject(err);
    }
  });

//Xếp hạng các user trong tournament theo equity
//input: tournament_id,user_id
const sort_by_equity = (item) =>
  new Promise(async (resolve, reject) => {
    try {
      const { tournament_id, user_id, limit } = item;
      const offset = item.offset || 0;
      let role = item.role || ``;

      //Lấy list demo_account trong redis
      const realtime_demo_account = await redis_db.hmgetAsync(
        REALTIME_DEMO_ACCOUNT
      );
      // const list_demo_account = Object.values(realtime_demo_account);

      const user_info_list = await redis_db.hmgetAsync(USER_PROFILE)
      const list_demo_account = Object.values(realtime_demo_account);

      let list_user = [];
      list_demo_account.forEach((demo_account) => {
          demo_account = JSON.parse(demo_account);
          if (demo_account.tournament_id === tournament_id) {

              const client_id = demo_account.user_id

              demo_account.amount = demo_account.equity;
              const user_info_json = user_info_list[client_id]
              if (user_info_json) {

                  const user_info = JSON.parse(user_info_json)
                  demo_account = {
                      ...demo_account,
                      ...user_info
                  }
              }
             
              list_user.push(demo_account);
          }
      });

      //Sắp xếp list user tìm được theo equity
      list_user.sort(function (a, b) {
        return b.equity - a.equity;
      });

      const total_users = list_user.length;

      //Lấy rank hiện tại của user
      let current_user = {};
      if (role === ROLE_USER) {
        for (var i = 0; i < list_user.length; i++) {
          if (user_id === list_user[i].id) {
            current_user = list_user[i];
            current_user.user_rank = i + 1;
          }
        }
      }

      //Phân trang
      if (!limit) {
        list_user = list_user.slice(offset);
      } else {
        list_user = list_user.slice(offset, offset+limit);
      }

      return resolve({ list_user, current_user, total_users });
    } catch (err) {
      console.error(err);
      return reject(err);
    }
  });

module.exports = {
    sort_by_balance,
    sort_user_by_performance,
    sort_by_equity,
};

