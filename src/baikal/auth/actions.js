import win from "core/window"

/**
 * Starts the authorization for baikal
 * Launchs a new window that will make an authorize request to the authserver
 *  - The Authserver authorize endpoint is specified in the swagger file
 *  - The client_id comes from Baikal Plugin configuration (config.clientId) and must be the
 *    clientId for the Portal app registered in the ADB server
 *  - The scopes are those the user selected in the SwaggerUI
 *  - The redirect_uri comes from the oauth2RedirectUrl config for the SwaggerUI client,
 *    and it's a Baikal Portal oauth callback endpoint
 *  - The state contains the Authserver token endpoint that the oauth callback at Portal
 *    server will need to exchange the received code for a token
 * http://authserver/oauth/authorize?response_type=code&scope=read&client_id
 * Currently only supports the authcode flow
 *
 * The response from the authserver will be a redirect to the baikal portal redirect_uri with
 * the oauth code. The Portal will exchange that code for an access_token using the token
 * endpoint specified in the state that comes from the redirect and the secret that identifies
 * the portal that is not shared with our developers.
 * Once the token is in the portal, it will redirect to the baikal-redirect.html page specifiying
 * the access_token in the querystring. baikal-redirect.html page will take that token and execute
 * a callback function that it's in the window object, and close itself. This way, this SwaggerUI
 * will get the access_token to perform request in the name of a user using the hidden portal credentials
 *
 * TODO: The Portal should not reveal the access token and store it in the web session
 */
export const getAuthorization = auth => ({ errActions, baikalActions, authSelectors, getConfigs }) => {
  const { schema, scopes, name } = auth
  const { scopeSeparator, clientId } = authSelectors.getConfigs()
  let redirectUrl = getConfigs().oauth2RedirectUrl
  let authorizationUrl = schema.get("authorizationUrl")
  let tokenUrl = schema.get("tokenUrl")
  let state = tokenUrl
  let flow = schema.get("flow")

  if (flow === "password" || flow === "application" || flow === "implicit") {
    errActions.newAuthErr( {
      authId: name,
      source: "validation",
      level: "error",
      message: "Unsupported flow method in Baikal",
    })
    return
  }

  // Setup the callback that baikal-redirect.html will call with the token
  win.baikalRedirectOauth2 = {
    auth,
    callback: baikalActions.authorize,
  }

  // Build the authserver "/authorize"" url
  let params = {
    "response_type": "code",
    "redirect_uri": encodeURIComponent(redirectUrl),
    "scope": encodeURIComponent(scopes.join(scopeSeparator)),
    "state": encodeURIComponent(state),
    "client_id": encodeURIComponent(clientId),
  }

  let queryString = Object.keys(params)
    .map(key => `${key}=${params[key]}`)
    .join("&")

  let url = authorizationUrl.concat("?", queryString)

  // Open a new window
  win.open(url)
}

export const authorize = (err, payload) => ({authActions, errActions}) => {
  if (err) {
    return errActions.newAuthErr({
      authId: err.authName,
      source: "auth",
      level: "error",
      message: err.message
    })
  }
  authActions.authorizeOauth2(payload)
}
