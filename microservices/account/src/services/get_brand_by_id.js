const handler_hasura = require('../helpers/handler_hasura')

const GET_BRAND = `query MyQuery($brand_id: uuid) {
  brand(where: {id: {_eq: $brand_id}}) {
    user_profiles_aggregate {
      aggregate {
        count
      }
    }
    id
    name
    status
    created_at
    address
    company_name
    tax
    logo
    description
    email
    phone_number
    updated_at
    website
  }
}
`

module.exports = (brand_id) => new Promise(async (resolve, reject) => {
  try{
    const result = await handler_hasura({brand_id}, GET_BRAND)

    const brand = result.data.brand[0]
 
    return resolve(brand)
  }catch(error){
    console.log(error)
    return reject("error")
  }
})