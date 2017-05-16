import Swagger from "swagger-client"
import parseUrl from "url-parse"

// Modifies the requests done by the ui to redirect the request done to our gateway
// to pass thorugh our proxy
// Kinda ugly, but its the only way to intercept the requests
export default staticConfig => ({ configs }) => {

  const preFetch = req => {
    const { gateway, proxy } = staticConfig

    let originalUrl = parseUrl(req.url)
    let destinationUrl = parseUrl(gateway)

    if (originalUrl.origin === destinationUrl.origin) {
      req.url = req.url.replace(originalUrl.origin, proxy)
    }

    return req
  }

  return {
    fn: {
      fetch: Swagger.makeHttp(preFetch, configs.postFetch),
    }
  }
}
