process.env.NTBA_FIX_319 = 1;
const {TELEGRAM_TOKEN_BOT} = require('../../constants/constants')
const TelegramBot = require('node-telegram-bot-api');
const { create_random_code } = require('../helpers/random_code')
const { update_phone_in_user_profile, get_user_by_phone_and_otp, get_phone_otp, create_phone_otp, update_phone_otp } = require('./otp')

// // replace the value below with the Telegram token you receive from @BotFather


module.exports = () => {
  console.log("Bot Verify Telegram")
  const bot = new TelegramBot(TELEGRAM_TOKEN_BOT, { polling: true });
  bot.onText(/\/resend-otp/, (msg) => {
    send_code(msg)
  });


  bot.onText(/\/otp/, (msg) => {
    send_code(msg)
  });

  bot.on("message", async (msg_contact) => {
    const phone_number = msg_contact.contact ? msg_contact.contact.phone_number : null

    if (phone_number) {
      //Lấy user theo phone + is_verify_otp=true
      const user_list = await get_user_by_phone_and_otp({
        phone_number
      })

      if (user_list.length > 0) {
        bot.sendMessage(msg_contact.chat.id, "Số điện thoại đã được xác thực otp")
        return
      }

      var option_reply = {
        reply_markup: JSON.stringify({ force_reply: true }),
      }

      bot.sendMessage(msg_contact.chat.id, "Vui lòng nhập email", option_reply).then(rep_email => {

        bot.onReplyToMessage(rep_email.chat.id, rep_email.message_id, async (rep_email_text) => {
          try {
            const email = rep_email_text.text.toLowerCase()

            if (email) {
              //update số dth vào user_id này
              const user_updated = await update_phone_in_user_profile({ email, phone_number })
              if (!user_updated) {
                bot.sendMessage(rep_email.chat.id, "email không hợp lệ")
                return
              }
            }

            const phone_otp = await get_phone_otp(phone_number)
            // create code and hash code
            const code = await create_random_code()
            const item = {
              phone_number,
              code_hash: code.hash,
            }

            if (!phone_otp) {
              //create phone_otp
              await create_phone_otp(item)
            } else {
              await update_phone_otp(item)
            }

            bot.sendMessage(rep_email.chat.id, `Mã xác nhận của bạn là: ${code.random_number}`)
          } catch (error) {
            console.log(error)
            bot.sendMessage(rep_email.chat.id, { error })
            return
          }
        })
      })
    }
  });

  const send_code = (msg) => {
    const chatId = msg.chat.id;

    var option = {
      "parse_mode": "Markdown",
      "reply_markup": {
        "one_time_keyboard": true,
        "keyboard": [[{

          text: "Số điện thoại của tôi",
          request_contact: true
        }], ["Cancel"]]
      }
    };
    // var option  = {
    //   reply_markup: JSON.stringify({ force_reply: true }),
    // }
    bot.sendMessage(chatId, "Vui lòng nhập số điện thoại", option)
  }

}
