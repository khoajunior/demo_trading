const { ACCESS_KEY_ID, SECRET_ACCESS_KEY, BUCKET_NAME } = require('../../constants/constants')
const AWS = require('aws-sdk')
const { v4: uuid } = require('uuid')

module.exports = (item, folder = null) => new Promise(async(resolve, reject) => {
    console.log(`API service upload avatar`)
    try {
        const { file } = item

        const s3 = new AWS.S3({
            accessKeyId: ACCESS_KEY_ID,
            secretAccessKey: SECRET_ACCESS_KEY
        })
        const id = uuid()

        const params = {
            Bucket: BUCKET_NAME,
            Key: `${folder}/${id}.jpg`,
            Body: file.data,
            ACL: 'public-read'
        }
        const s3_result = await s3.upload(params).promise()
        const url = s3_result.Location
        return resolve(url)

    } catch (error) {
        console.log(`err in upload s3: `, error)
        return reject('Upload file tới store thất bại')
    }
});