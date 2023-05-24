//----------------------------------------Sendgrid-------------------------------------------------------
// const sg = require('sendgrid')
// const sgMail = require('sendgrid').mail
const {
    TWILLIO_EMAIL, TWILLIO_SECRET_KEY, FRONT_END_URL,
    MAILGUN_API_KEY, MAILGUN_DOMAIN, MAILGUN_EMAIL
} = require('../../constants/constants')
const {fetch_Hasura} = require('./hasura')
var mailgun = require('mailgun-js')({ apiKey: MAILGUN_API_KEY, domain: MAILGUN_DOMAIN });


const GET_ALL__EMAIL = `
    
`

// const send_email = (item) => new Promise(async(resolve, reject) => {
//     console.log(`service send email`)
//     try {
//         const { email, code } = item
//         //hex string
//         const user = JSON.stringify({
//             email,
//             code
//         })
//         const hexString = Buffer.from(user).toString('hex')

//         const customer_email = email

//         const fromEmail = new sgMail.Email(TWILLIO_EMAIL)
//         const toEmail = new sgMail.Email(customer_email)
//         const subject = 'Merritrade Admin'
//         const link = `${FRONT_END_URL}/verified-successfully?code=${hexString}`
//         const content = new sgMail.Content(
//             'text/html',
//             `Xin chào, đây là email xác thực từ Merritrade: <br>           
//             Click vào đường dẫn để thực hiện việc xác thực: <a href=${link}>Tại đây</a>     
//             <br>Email sẽ hết hạn sau 15 phút<br>        
//             `
//         )
//         const mail = new sgMail.Mail(fromEmail, subject, toEmail, content)

//         const sg_object = sg(TWILLIO_SECRET_KEY)

//         const request = sg_object.emptyRequest({
//             method: 'POST',
//             path: '/v3/mail/send',
//             body: mail.toJSON()
//         })
//         sg_object.API(request, (error, message) => {
//             if (error) {
//                 console.log(`Err in sg_object.API: `, error)
//                 return reject('Send email fail')
//             }
//             return resolve('Send email success')
//         })


//     } catch (error) {
//         console.log(`Err in send_email service: `, error)
//         return reject(error)
//     }
// })


//--------------------------------------------------MAILGUN-------------------------------------------------

const send_email = (item, is_veriy_email = true) => new Promise((resolve, reject) => {
    try {
        const { email, code } = item
        //hex string
        const user = JSON.stringify({
            email,
            code
        })
        const hexString = Buffer.from(user).toString('hex')
        const customer_email = email
        var link = `${FRONT_END_URL}/verified-successfully?code=${hexString}`
        var html = `Xin chào, đây là email xác thực từ MerriTrade: <br>           
        Click vào đường dẫn để thực hiện việc xác thực: <a href=${link}>Tại đây</a>`
        // forgot_password
        if (!is_veriy_email) {
            link = `${FRONT_END_URL}/reset-password?code=${hexString}`
            html =  `Xin chào, đây là email hỗ trợ người dùng quên mật khẩu từ Merritrade: <br>           
            Click vào đường dẫn để thực hiện việc thay đổi mật khẩu: <a href=${link}>Tại đây</a>`

        }
        const subject = 'MerriTrade Admin'

        const data = {
            from: MAILGUN_EMAIL,
            to: customer_email,
            subject,
            html  
        };

        mailgun.messages().send(data, (error, body) => {
            if (error) {
                console.log(`Err in sg_object.API: `, error)
                return reject('Send email fail')
            }
            return resolve('Send email success')
        });

    } catch (error) {
        console.log(`Err in send_email service: `, error)
        return reject('Gửi mail tới người nhận không thành công')

    }
})

const send_email_custom = async (emails, content, subject) => {
    try {
        const length = emails.length;
        for(let i = 0; i < length; i +=10) {
            const requests = emails.slice(i, i + 10).map((email) => {
                return send_email_template(email, content, subject).catch(e => console.log(e));
            })

            await Promise.all(requests)
              .catch(e => console.log(`Error in sending email `));
        }
    } catch (error) {
        console.log(`Err in send_email service: `, error);
        return error;
    }
}

const send_email_all_user = async (content, subject) => {
    try {
        const getAllEmail = await fetch_Hasura(GET_ALL__EMAIL, {}).then(data => data.data.user_profile);
        const emails = getAllEmail.map(item => {
            return item.email
        })
        const length = emails.length
        for(let i = 0; i < length; i +=10) {
            const requests = emails.slice(i, i + 10).map((email) => {
                return send_email_template(email, content, subject).catch(e => console.log(e));
            })

            await Promise.all(requests)
              .catch(e => console.log(`Error in sending email `))
        }
    } catch (err) {
        console.log(`Err in send_email service: `, err)
        return err
    }
}

const send_email_template = (email, content, subject) => new Promise((resolve, reject) => {
    try {
        const data = {
            from: MAILGUN_EMAIL,
            to: email,
            subject,
            html: content
        };

        mailgun.messages().send(data, (error, body) => {
            if (error) {
                console.log(`Err in sg_object.API: `, error)
                return reject('Send email fail')
            }
            return resolve('Send email success')
        });
    }catch (error) {
        console.log(`Err in send_email service: `, error)
        return reject('Gửi mail tới người nhận không thành công');
    }
})

module.exports = {
    send_email,
    send_email_custom,
    send_email_all_user
}
