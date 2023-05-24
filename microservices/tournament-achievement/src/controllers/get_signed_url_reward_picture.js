const S3 = require('aws-sdk/clients/s3')
const { Credentials } = require('aws-sdk')
const { v4: uuid } = require('uuid')

const { ACCESS_KEY_ID, SECRET_ACCESS_KEY, BUCKET_NAME, S3_REGION } = require('../../constants/constants')
const ACTION = `Lấy signed url không thành công`

module.exports = async(req, res) => {
    try {
        const id = uuid()

        const access = new Credentials({
            accessKeyId: ACCESS_KEY_ID,
            secretAccessKey: SECRET_ACCESS_KEY,
        })

        const s3 = new S3({
            credentials: access,
            region: S3_REGION,
            signatureVersion: 'v4',
        })

        const signedUrlExpireSeconds = 60 * 15

        const presigned_url = await s3.getSignedUrlPromise('putObject', {
            Bucket: BUCKET_NAME,
            Key: `rewards/${id}.jpg`,
            ContentType: 'image/jpeg',
            ACL: 'public-read',
            Expires: signedUrlExpireSeconds,
        })

        return res.json({ status: 200, message: 'Handle success', data: {
            url: `https://${BUCKET_NAME}.s3.ap-southeast-1.amazonaws.com/rewards/${id}.jpg`,
            presigned_url,
        }})
    } catch (err) {
        return res.status(400).json({
            code: `handle_fail`,
            message: `${ACTION}: ${err}`
        })
    }
}