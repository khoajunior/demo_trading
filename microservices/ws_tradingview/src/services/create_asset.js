const { CREATE_OR_UPDATE_ASSET } = require('../../constants/constants')
const handler_hasura = require('../helpers/handler_hasura')
const random_int = require('../helpers/random_int')


const CREATE_ASSET_MUTATION = `
    mutation MyMutation2($name: String, $buy_swap: float8, $sell_swap: float8, $scale_percent: Int, $standard_volume: float8) {
    insert_asset(objects: {name: $name, buy_swap: $buy_swap, scale_percent: $scale_percent, sell_swap: $sell_swap, standard_volume: $standard_volume}) {
      returning {
        buy_swap
        created_at
        standard_volume
        id
        name
        scale_percent
        sell_swap
        swap_id
        updated_at
      }
    }
  }
`

const UPDATE_ASSET_MUTATION = `mutation MyMutation2($name: String, $buy_swap: float8, $sell_swap: float8, $scale_percent: Int,  $standard_volume: float8) {
    update_asset(where: {name: {_eq: $name}}, _set: {buy_swap: $buy_swap, scale_percent: $scale_percent, sell_swap: $sell_swap, standard_volume: $standard_volume}) {
      returning {
        buy_swap
        created_at
        standard_volume
        id
        name
        scale_percent
        sell_swap
        swap_id
        updated_at
      }
    }
  }`

const GET_ASSET = `
    query MyQuery ($name: String){
        asset(limit: 1, where: {name: {_eq: $name}}) {
        created_at
        id
        name
        scale_percent
        swap_id
        updated_at
        }
    }
`

module.exports = async () => {
    try {

        const {IS_NEW_UPDATING, ASSET_OBJECT} = CREATE_OR_UPDATE_ASSET
        if(!IS_NEW_UPDATING){
            return
        }
        const asset_list = Object.values(ASSET_OBJECT)
        const promise_asset = []

        for(var i = 0; i < asset_list.length; i++){
            const asset = asset_list[i]
            // console.log({asset})
            const asset_result = await handler_hasura({name: asset.name}, GET_ASSET)

            const existed_assets = asset_result.data.asset
            // console.log({ existed_assets })
            if (existed_assets && existed_assets.length > 0) {
                const update_asset_promise = handler_hasura(asset, UPDATE_ASSET_MUTATION)
                promise_asset.push(update_asset_promise)
            }else{
                const create_asset_promise = handler_hasura(asset, CREATE_ASSET_MUTATION)
                promise_asset.push(create_asset_promise)

            }

        }

        await Promise.all(promise_asset)
        

    } catch (error) {
        console.log(error)
    }
}

