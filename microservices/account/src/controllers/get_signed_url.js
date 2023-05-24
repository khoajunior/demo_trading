const S3 = require('aws-sdk/clients/s3')
const { Credentials } = require('aws-sdk')
const { get_user_hasura } = require('../services/hasura')
const { ACCESS_KEY_ID, SECRET_ACCESS_KEY,
    BUCKET_NAME, S3_REGION, LINK_FRONT_CMND,
    LINK_BACK_CMND, LINK_AVATAR, LINK_COVER_IMAGE_TOURNAMENT,
    ROLE_USER, LINK_PDF_CONDITION, LINK_BRAND_LOGO,
    LINK_FRONT_PASSPORT, LINK_BACK_PASSPORT} = require('../../constants/constants')
const ACTION = 'Lấy link url không thành công'
const { v4: uuid } = require('uuid')

module.exports = async (req, res) => {
    try {
        const session_variables = req.body.session_variables
        const user_id = session_variables['x-hasura-user-id']
        const user_role = session_variables['x-hasura-role']
        const item = req.body.input

        const type = item.type || LINK_AVATAR

        //check user exist
        if (type != 4) {
            await get_user_hasura(user_id)
        }

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
        let url
        let presigned_url
        let user_id_input = item.user_id
        if (user_role === ROLE_USER || !item.user_id) {
            user_id_input = user_id
        }
        //Role user không được update link của user khác
        if (user_role === ROLE_USER && item.user_id && item.user_id != user_id) {
            return res.status(400).json({
                code: "permission_wrong",
                message: `${ACTION}: Bạn không thể sửa ảnh của user khác`,
            })
        }
        //Role user không được update link của giải đấu
        const check_link_update_for_admin = (type === LINK_BRAND_LOGO || type === LINK_COVER_IMAGE_TOURNAMENT)
        if (user_role === ROLE_USER && check_link_update_for_admin) {
            return res.status(400).json({
                code: "permission_wrong",
                message: `${ACTION}: Bạn không được cấp quyền để thực hiện thao tác này`,
            })
        }

        const id = uuid()
        switch (type) {
            case LINK_FRONT_CMND:
                presigned_url = await s3.getSignedUrlPromise('putObject', {
                    Bucket: BUCKET_NAME,
                    Key: `national_id/front-${user_id_input}.jpg`,
                    ContentType: 'image/jpeg',
                    ACL: 'public-read',
                    Expires: signedUrlExpireSeconds,
                })
                url = `https://${BUCKET_NAME}.s3.ap-southeast-1.amazonaws.com/national_id/front-${user_id_input}.jpg`
                break;
            case LINK_BACK_CMND:
                presigned_url = await s3.getSignedUrlPromise('putObject', {
                    Bucket: BUCKET_NAME,
                    Key: `national_id/back-${user_id_input}.jpg`,
                    ContentType: 'image/jpeg',
                    ACL: 'public-read',
                    Expires: signedUrlExpireSeconds,
                })
                url = `https://${BUCKET_NAME}.s3.ap-southeast-1.amazonaws.com/national_id/back-${user_id_input}.jpg`
                break;
            case LINK_COVER_IMAGE_TOURNAMENT:
                presigned_url = await s3.getSignedUrlPromise('putObject', {
                    Bucket: BUCKET_NAME,
                    Key: `cover_image_tournament/${id}.jpg`,
                    ContentType: 'image/jpeg',
                    ACL: 'public-read',
                    Expires: signedUrlExpireSeconds,
                })
                url = `https://${BUCKET_NAME}.s3.ap-southeast-1.amazonaws.com/cover_image_tournament/${id}.jpg`
                break;
            case LINK_PDF_CONDITION:
                presigned_url = await s3.getSignedUrlPromise('putObject', {
                    Bucket: BUCKET_NAME,
                    Key: `pdf_condition/${id}.pdf`,
                    ContentType: 'application/pdf',
                    ACL: 'public-read',
                    Expires: signedUrlExpireSeconds,
                })
                url = `https://${BUCKET_NAME}.s3.ap-southeast-1.amazonaws.com/pdf_condition/${id}.pdf`
                break;
            case LINK_BRAND_LOGO:
                presigned_url = await s3.getSignedUrlPromise('putObject', {
                    Bucket: BUCKET_NAME,
                    Key: `brand_logo/${id}.jpg`,
                    ContentType: 'image/jpeg',
                    ACL: 'public-read',
                    Expires: signedUrlExpireSeconds,
                })
                url = `https://${BUCKET_NAME}.s3.ap-southeast-1.amazonaws.com/brand_logo/${id}.pdf`
                break;
            case LINK_FRONT_PASSPORT:
                presigned_url = await s3.getSignedUrlPromise('putObject', {
                    Bucket: BUCKET_NAME,
                    Key: `passport/front-${user_id_input}.jpg`,
                    ContentType: 'image/jpeg',
                    ACL: 'public-read',
                    Expires: signedUrlExpireSeconds,
                })
                url = `https://${BUCKET_NAME}.s3.ap-southeast-1.amazonaws.com/passport/front-${user_id_input}.jpg`
                break;
            case LINK_BACK_PASSPORT:
                presigned_url = await s3.getSignedUrlPromise('putObject', {
                    Bucket: BUCKET_NAME,
                    Key: `passport/back-${user_id_input}.jpg`,
                    ContentType: 'image/jpeg',
                    ACL: 'public-read',
                    Expires: signedUrlExpireSeconds,
                })
                url = `https://${BUCKET_NAME}.s3.ap-southeast-1.amazonaws.com/passport/back-${user_id_input}.jpg`
                break;
            default:
                presigned_url = await s3.getSignedUrlPromise('putObject', {
                    Bucket: BUCKET_NAME,
                    Key: `avatar/${user_id_input}.jpg`,
                    ContentType: 'image/jpeg',
                    ACL: 'public-read',
                    Expires: signedUrlExpireSeconds,
                })
                url = `https://${BUCKET_NAME}.s3.ap-southeast-1.amazonaws.com/avatar/${user_id_input}.jpg`
                break;
        }
        return res.json({
            status: 200,
            message: 'Handle success',
            data: { url, presigned_url }
        })
    } catch (err) {
        console.error(err)
        return res.status(400).json({
            code: "handle_fail",
            message: `${ACTION}: ${err}`,
        })
    }
}
