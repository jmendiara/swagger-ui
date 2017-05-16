import baikalOauth2 from "./baikalOauth.jsx"
import auths from "./auths.jsx"
import * as actions from "./actions"

export default () => {
  return {
    statePlugins: {
      baikal: {
        actions
      },
    },
    components: {
      baikalOauth2,
      auths,
    },
  }
}
