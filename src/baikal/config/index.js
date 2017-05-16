// Expose the plugin config
// Access:
//  * In a component this.props.baikalSelectors.config()
//  * In other pieces of swagger: toolbox.baikalSelectors.config()

export default staticConfig => () => {
  return {
    statePlugins: {
      baikal: {
        selectors: {
          config: () => staticConfig,
        },
      },
    },
  }
}
