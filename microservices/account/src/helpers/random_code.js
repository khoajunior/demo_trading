const bcrypt = require('bcryptjs');
const { SALT, TIME_EXPIRE } = require('../../constants/constants')


const create_random_code = () => new Promise(async(resolve, reject) => {
    try {
        const random_number = Math.floor(Math.random() * 8999) + 1000

        bcrypt.hash(random_number.toString(), SALT, async(err, hash) => {
            if (err) {
                return reject(err)
            } else {
                const ouptut = {
                    random_number,
                    hash
                }

                return resolve(ouptut)
            }
        })
    } catch (err) {
        return reject('Tạo mã xác nhận thất bại')
    }
})

//Input: code(Integer),hash( chuỗi hash để so sánh),exp_time( thời gian hết hạn)
const check_random_code = (code, hash, exp_time) => new Promise(async(resolve, reject) => {
    try {
        if(!code){
            return reject("Nhấn gửi lại để nhận mã xác nhận mới")
        }
        //check exp time
        const current_time = new Date().toISOString()
        if (current_time > exp_time) {
            console.log(`Code is expired`)
            return reject('Code đã hết hạn')
        }

        //check code
        bcrypt.compare(code.toString(), hash, function(err, result) {
            if (err) {
                console.error(err)
                return reject(err)
            }
            if (result == true) {
                return resolve(`Xác thực thành công`)
            }
            if (result == false) {
                return reject(`Code không chính xác`)
            }
        });
    } catch (err) {
        console.log(`err here1`, err)
        return reject('Mã xác nhận của bạn không hợp lệ')
    }
})

module.exports = {
    create_random_code,
    check_random_code
}