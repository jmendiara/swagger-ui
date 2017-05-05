import Swagger from "swagger-client"
import parseUrl from "url-parse"

module.exports = function(toolbox) {
  let { configs } = toolbox

  function preFetch(req) {
    let { fpGateway, fpPortalProxy } = toolbox.getConfigs()

    let originalUrl = parseUrl(req.url)
    let destinationUrl = parseUrl(fpGateway)

    if (originalUrl.origin === destinationUrl.origin) {
      req.url = req.url.replace(originalUrl.origin, fpPortalProxy)
    }

    return req
  }


  return {
    fn: {
      fetch: Swagger.makeHttp(preFetch, configs.postFetch),
      buildRequest: Swagger.buildRequest,
      execute: Swagger.execute,
      resolve: Swagger.resolve,
      serializeRes: Swagger.serializeRes
    }
  }
}
