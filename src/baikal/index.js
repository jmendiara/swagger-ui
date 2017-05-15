import StandaloneLayout from "../standalone/layout"
import Config from "./config"
import Oauth2 from "./auth"
import SwaggerJS from "./swagger-js"

import "../style/main.scss"

/**
 * The baikal swagger-ui preset
 * A preset is a set of plugins to the main swagger-ui behaviour
 *
 * As the plugin needs configuration, the preset is
 * using a hack till https://github.com/swagger-api/swagger-ui/issues/3061 is resolved
 *
 * @param {object} staticConfig - The static plugin configuration
 * @param {object} staticConfig.gateway - The base url for the request that should
 * be intercepted and redirected to the baikal portal
 * @param {object} staticConfig.proxy - The base url to redirect the requests that should
 * go to the gateway
 */

module.exports = (staticConfig) => {
  let preset = [
    Config(staticConfig),
    SwaggerJS(staticConfig),
    Oauth2,
    () => {
      return {
        components: { StandaloneLayout },
      }
    },
  ]

  return preset
}
