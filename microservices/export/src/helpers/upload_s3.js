const { ACCESS_KEY_ID, SECRET_ACCESS_KEY, BUCKET_NAME } = require('../../constants/constants')
const AWS = require('aws-sdk')
const { v4: uuid } = require('uuid')

module.exports = (item, folder = null) => new Promise(async(resolve, reject) => {
    try {
        const s3 = new AWS.S3({
            accessKeyId: ACCESS_KEY_ID,
            secretAccessKey: SECRET_ACCESS_KEY
        })
        const id = uuid()

        let params = {}
        if (item.file) { //Upload ảnh
            params = {
                Bucket: BUCKET_NAME,
                Key: `${folder}/${id}.jpg`,
                Body: item.file.data,
                ACL: 'public-read'
            }
        }
        if (item.data) { //Upload file excel
            params = {
                Bucket: BUCKET_NAME,
                Key: `${folder}/${id}.xlsx`,
                Body: Buffer.from(item.data),
                ACL: 'public-read'
            }
        }
        const s3_result = await s3.upload(params).promise()
        const url = s3_result.Location
        return resolve(url)

    } catch (error) {
        console.log(error)
        return reject(`Upload s3 không thành công`)
    }
});