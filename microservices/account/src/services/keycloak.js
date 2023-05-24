const {
  USER_API_URL,
  KEYCLOAK_USERNAME,
  KEYCLOAK_PASSWORD,
  KEYCLOAK_URL,
  KEYCLOAK_REALM,
  REALM_URL,
} = require("../../constants/constants");
const fetch = require("node-fetch");
const getToken = require("../helpers/get_token");

const {
  get_user_by_userId,
  get_user_by_email,
} = require("../helpers/handler_keycloak");

const delete_user_keycloak = (id) =>
  new Promise(async (resolve, reject) => {
    try {
      var output_get_token = await getToken(
        KEYCLOAK_USERNAME,
        KEYCLOAK_PASSWORD
      );
      const accessToken = output_get_token.access_token;
      const deleteUser = {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      };
      const deletePath = `${USER_API_URL}/${id}`;
      await fetch(deletePath, deleteUser);
      return resolve("Handle success");
    } catch (err) {
      console.error(err);
      return reject("Delete user in keycloak failures");
    }
  });

const send_verify_email = (email) =>
  new Promise(async (resolve, reject) => {
    try {
      var output_get_token = await getToken(
        KEYCLOAK_USERNAME,
        KEYCLOAK_PASSWORD
      );
      const accessToken = output_get_token.access_token;

      const result = await get_user_by_email(email);

      if (
        result[0] &&
        result[0].email === email &&
        !result[0].emailVerified &&
        result[0].id
      ) {
        const sentVerificationEmail = {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        };
        await fetch(
          //"&redirect_uri="+redirectUrl+"&client_id="+clientId;
          `${USER_API_URL}/${result[0].id}/send-verify-email?client_id=hasura-keycloak-connector&redirect_uri=https://www.google.com`,
          sentVerificationEmail
        );
      } else {
        return reject("User mail is verfied or not existing");
      }

      return resolve("Handle success");
    } catch (err) {
      console.error(err);
      return reject(err);
    }
  });

const update_username_email = (item) =>
  new Promise(async (resolve, reject) => {
    try {
      const { user_id, new_username, new_email} = item;
      var output_get_token = await getToken(
        KEYCLOAK_USERNAME,
        KEYCLOAK_PASSWORD
      );
      const access_token = output_get_token.access_token;

      //config for update username
      let options = {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${access_token}`,
        },
        body: JSON.stringify({ editUsernameAllowed: true }),
      };
      await fetch(REALM_URL, options);
      const user = await get_user_by_userId(user_id);

      const email = user.email
      const new_updated_info = {}

      if(new_email && new_email != email){
        new_updated_info.email = new_email
        new_updated_info.emailVerified = false
      }

      if(new_username){
        new_updated_info.username = new_username
      }
      //update username in keycloak
      options = {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${access_token}`,
        },
        body: JSON.stringify({...new_updated_info}),
      };


      // if (!user.emailVerified) {
      //   return reject("Email isn't verfied");
      // }
      const UPDATE_USERNAME_URL = `${USER_API_URL}/${user.id}`;
      const update_user = await fetch(UPDATE_USERNAME_URL, options);

      if (update_user.status != 204) {
        const result = await update_user.json();

        const message = result.error || result.errorMessage; //TODO: sửa lại thành trả về user
        return reject(message);
      }

      return resolve("Update keycloak successfully");
    } catch (err) {
      return reject(err);
    }
  });

//Input: email
const update_verify_email = (item) =>
  new Promise(async (resolve, reject) => {
    try {
      const user = await get_user_by_email(item.email);
      const { access_token } = await getToken(
        KEYCLOAK_USERNAME,
        KEYCLOAK_PASSWORD
      );

      let options = {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${access_token}`,
        },
        body: JSON.stringify({
          emailVerified: true,
          requiredActions: [],
        }),
      };

      const url = `${USER_API_URL}/${user[0].id}`;
      const result = await fetch(url, options);
      return resolve(result);
    } catch (err) {
      return reject(err);
    }
  });

const logout_user=(item)=>new Promise(async(resolve,reject)=>{
  try{
    const {session_state}=item

    const {access_token}=await getToken(KEYCLOAK_USERNAME,KEYCLOAK_PASSWORD)

    let list_session=session_state
    if(typeof(session_state)===String){
        list_session[0].id = session_state
    }

    if(list_session.length==0){
      return resolve(true)
    }

    for(var i=0;i<list_session.length;i++){
      const url=`${KEYCLOAK_URL}/auth/admin/realms/${KEYCLOAK_REALM}/sessions/${list_session[i].id}`
      const logoutUser = {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${access_token}`,
        },
      };
      const response = await fetch(url, logoutUser);
      if(response.status!=204){
        console.log({response})
        return reject(response.error)
      }
    }
    
    return resolve(true)
  }catch(err){
      console.log({err})
      return reject(err)
  }
})

const delete_required_action = (item) =>
  new Promise(async (resolve, reject) => {
    try {
      const {user_id}=item
      const { access_token } = await getToken(
        KEYCLOAK_USERNAME,
        KEYCLOAK_PASSWORD
      );

      let options = {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${access_token}`,
        },
        body: JSON.stringify({
          requiredActions: [],
        }),
      };

      const url = `${USER_API_URL}/${user_id}`;
      const result = await fetch(url, options);
      return resolve(result);
    } catch (err) {
      return reject(err);
    }
});

const get_session_user = (item) => new Promise(async (resolve, reject) => {
    try {
      const {user_id}=item

      const {access_token} = await getToken(KEYCLOAK_USERNAME,KEYCLOAK_PASSWORD)
      const url=`${USER_API_URL}/${user_id}/sessions`      

      const get_session = {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${access_token}`,
        },
      }

      const response = await fetch(url, get_session);
      const result=await response.json()
      
      if(result.error){
          return reject(result.error)
      }
      return resolve(result)
    } catch (err) {
      return reject(err);
    }
});

module.exports = {
  delete_user_keycloak,
  send_verify_email,
  update_username_email,
  update_verify_email,
  logout_user,
  delete_required_action,
  get_session_user
};
