const axios = require('axios')
const { HANDLE_NANTIONAL_CARD_URL, SIZE_AVAILABLE_PASSPORT } = require('../../constants/constants')
const {update_national_card} = require('../services/user')

module.exports = async (req, res) => {
  try {
    const session_variables = req.body.session_variables
    const user_id = session_variables['x-hasura-user-id']
    const { front_url_national_id, back_url_national_id, isPassport } = req.body.input

    const { data: content } = await axios({
      url: HANDLE_NANTIONAL_CARD_URL,
      method: 'GET',
      headers: {
        "Content-Type": "application/json"
      },
      params: {
        link: front_url_national_id
      },
    })

    const data_values = Object.values(content);
    var card_id = null;
    if (isPassport) {
      for (let i = 0; i < data_values.length; i++) {
        const card = data_values[i]
        if (card.includes('Passport') ||
            card.includes('Passport N') ||
            card.includes('ho chieu') ||
            card.includes('Pass')){
          for (let j = SIZE_AVAILABLE_PASSPORT; j >= 0; j--) {
            if ((data_values[i + j].length > 0 && data_values[i + j].length < 9 )) {
                card_id = data_values[i + j];
                break;
              }
          }
        }
      }

      if (card_id == null) {
        return res.status(400).json({
          code: 'check_card',
          message: 'Không thể nhận diện được hộ chiếu'
        })
      }
    } else {
      for (var i = 0; i < data_values.length; i++) {

        const card = data_values[i]
        if (
          card.includes('GIAY CHUNG MINH NHAN DAN') ||
          card.includes('GIAY CHUNG') ||
          card.includes('CHUNG MINH') ||
          card.includes('NHAN DAN') ||
          card.includes('MINH NHAN')
        ) {
          card_id = data_values[i + 1]

          if (card_id.length > 12) {
            card_id = card_id.substring(card_id.length - 12)
          }

          if (isNaN(card_id)) {
            card_id = card_id.substring(card_id.length - 9)
          }

          if (!isNaN(card_id)) {
            break
          }
        }


        if (
          card.includes('Citizen ldentity Card') ||
          card.includes('Citizen') ||
          card.includes('Card') ||
          card.includes('dentity')
        ) {
          card_id = data_values[i + 1]
          card_id = card_id.substring(card_id.length - 12)
          if (!isNaN(card_id)) {
            break
          }
        }

        if (
          card.includes('Independence-FreedomHappiness') ||
          card.includes('Independence') ||
          card.includes('FreedomHappiness') ||
          card.includes('Happiness') ||
          card.includes('Freedom') ||
          card.includes('pendence-Freedom')
        ) {
          card_id = data_values[i + 3]
          card_id = card_id.substring(card_id.length - 12)
          if (!isNaN(card_id)) {
            break
          }
        }


        if (
          card.includes('SOCIALISTREPUBLICOFVIETNAN') ||
          card.includes('PUBLICOFVIET') ||
          card.includes('SOCIALIST') ||
          card.includes('REPUBLICOFVIETNAN')
        ) {
          card_id = data_values[i + 4]
          card_id = card_id.substring(card_id.length - 12)
          if (!isNaN(card_id)) {
            break
          }
        }

        if (
          card.includes('CAN CUOC CONG DAN') ||
          card.includes('CONG DAN') ||
          card.includes('CAN') ||
          card.includes('CONG') ||
          card.includes("CUOC")
        ) {
          card_id = data_values[i + 1]
          card_id = card_id.substring(card_id.length - 12)
          if (!isNaN(card_id)) {
            break
          }
        }

      }
      content.card_id = card_id
      if (!card_id || isNaN(card_id) || card_id.length < 9 ) {
        return res.status(400).json({
          code: 'check_card',
          message: 'Không thể nhận diện được chứng minh thư'
        })
      }
    }

      const new_profile = {
          user_id,
          national_id: card_id,
          front_url_national_id,
          back_url_national_id
      }
      const user = await update_national_card(new_profile)


      return res.json({ status: 200, message: 'handle success', data: user })



  } catch (error) {
    console.log(error)
    return res.status(400).json({
      code: 'check_card',
      message: error
    })
  }
}
