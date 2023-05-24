const { get_user_hasura, update_user } = require('../services/hasura')
const { create_random_code, check_random_code } = require('../helpers/random_code')
const { send_otp_voice,update_phone_in_user_profile, get_user_by_phone_and_otp, get_phone_otp, create_phone_otp, update_phone_otp, handle_verify_otp } = require('../services/otp')

const send_voice_otp = async(req, res) => {
  try {
    const session_variables = req.body.session_variables
    const user_id = session_variables['x-hasura-user-id']
    // const user_id=`8a5ab6da-6d29-4db1-b028-19573572f342`
    const { phone_number } = req.body.input

    //Lấy user theo phone + is_verify_otp=true
    const user_list = await get_user_by_phone_and_otp({
      phone_number
    })

    if( user_list.length > 0){
      return res.status(400).json({
        code: 'account_verified',
        message: "Số điện thoại đã được xác thực otp"
      })
    }

    if (user_id) {
      //update số dth vào user_id này
        const user_updated = await update_phone_in_user_profile({ user_id,phone_number })
        if(!user_updated){
          return res.status(400).json({
            code: 'account_verified',
            message: "Bạn đã xác thực otp trước đó"
          })
        }
    }

    const phone_otp = await get_phone_otp(phone_number)
    // create code and hash code
    const code = await create_random_code()
    const item = {
      phone_number,
      code_hash:code.hash,
    }

    if (!phone_otp) {
      //create phone_otp
      await create_phone_otp(item)
    } else {
      await update_phone_otp(item)
    }

    send_otp_voice({ code_number: code.random_number, phone: phone_number })
    // console.log(`------------------------------`,code.random_number)
    return res.json({ status: 200, message: 'Handle success', data: null })
  } catch (error) {
    console.log(error)
    return res.status(400).json({
      code: 'handle_fail',
      message: "Gửi mã xác thực thất bại"
    })
  }
}

const verify_otp=async(req,res)=>{
  try{
      const session_variables = req.body.session_variables
      const user_id = session_variables['x-hasura-user-id']
      // const user_id=`8a5ab6da-6d29-4db1-b028-19573572f342`

      const { code }=req.body.input

      const { phone_number, is_verified_otp } = await get_user_hasura(user_id)

      if(is_verified_otp){
        return res.status(400).json({
          code: 'user_verified',
          message: `Bạn đã xác thực otp trước đó`
        })
      }

      await handle_verify_otp({phone_number,code,user_id})

      return res.json({ status: 200, message: 'Handle success', data: null })
  }catch(error){
    console.log(error)
    return res.status(400).json({
      code: 'handle_fail',
      message: error
    })
  }
}

module.exports={
  send_voice_otp,
  verify_otp
}