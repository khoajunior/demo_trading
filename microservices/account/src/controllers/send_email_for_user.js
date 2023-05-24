const { send_email_custom, send_email_all_user } = require('../services/email')
const ACTION = `gửi email xác nhận thất bại`

const send_email_admin = async (req, res) => {
  try {
    const { emails, content, subject, sendAll } = req.body.input;
    if (sendAll) {
       send_email_all_user(content, subject);
    }else {
       send_email_custom(emails, content, subject);
    }
    return res.json({ status: 200, message: 'Handle success', data: null })
  }catch (err) {
    console.error(err)
    return res.status(400).json({
      code: "handle_fail",
      message: `${ACTION}: ${err}`,
    })
  }
}

module.exports = {
  send_email_admin,
}
