import React, { PropTypes } from "react"

export default class BaikalOauth2 extends React.Component {
  static propTypes = {
    name: PropTypes.string,
    authorized: PropTypes.object,
    getComponent: PropTypes.func.isRequired,
    schema: PropTypes.object.isRequired,
    authSelectors: PropTypes.object.isRequired,
    authActions: PropTypes.object.isRequired,
    errSelectors: PropTypes.object.isRequired,
    errActions: PropTypes.object.isRequired,
    getConfigs: PropTypes.any,
    baikalActions: PropTypes.object.isRequired,
    baikalSelectors: PropTypes.object.isRequired,
  }

  constructor(props, context) {
    super(props, context)
    let { name, schema } = this.props

    this.state = {
      name: name,
      schema: schema,
      scopes: []
    }
  }

  authorize =() => {
    let { errActions, baikalActions } = this.props

    errActions.clear({authId: name,type: "auth", source: "auth"})
    baikalActions.getAuthorization(this.state)
    //oauth2Authorize({auth: this.state, authActions, errActions, configs, authConfigs })
  }

  onScopeChange =(e) => {
    let { target } = e
    let { checked } = target
    let scope = target.dataset.value

    if ( checked && this.state.scopes.indexOf(scope) === -1 ) {
      let newScopes = this.state.scopes.concat([scope])
      this.setState({ scopes: newScopes })
    } else if ( !checked && this.state.scopes.indexOf(scope) > -1) {
      this.setState({ scopes: this.state.scopes.filter((val) => val !== scope) })
    }
  }

  onInputChange =(e) => {
    let { target : { dataset : { name }, value } } = e
    let state = {
      [name]: value
    }

    this.setState(state)
  }

  logout =(e) => {
    e.preventDefault()
    let { authActions, errActions, name } = this.props

    errActions.clear({authId: name, type: "auth", source: "auth"})
    authActions.logout([ name ])
  }

  render() {
    let { schema, getComponent, authSelectors, errSelectors, name } = this.props
    const Input = getComponent("Input")
    const Row = getComponent("Row")
    const Button = getComponent("Button")
    const AuthError = getComponent("authError")
    const JumpToPath = getComponent("JumpToPath", true)
    const Markdown = getComponent( "Markdown" )

    let scopes = schema.get("allowedScopes") || schema.get("scopes")
    let authorizedAuth = authSelectors.authorized().get(name)
    let isAuthorized = !!authorizedAuth
    let errors = errSelectors.allErrors().filter( err => err.get("authId") === name)
    let isValid = !errors.filter( err => err.get("source") === "validation").size

    return (
      <div>
        <h4>Baikal Authorization<JumpToPath path={[ "securityDefinitions", name ]} /></h4>
        { !this.state.appName ? null : <h5>Application: { this.state.appName } </h5> }
        <Markdown options={{html: true, typographer: true, linkify: true, linkTarget: "_blank"}}
                  source={ schema.get("description") } />

        { isAuthorized && <h6>Authorized</h6> }

        {
          !isAuthorized && scopes && scopes.size ? <div className="scopes">
            <h2>Scopes:</h2>
            { scopes.map((description, name) => {
              return (
                <Row key={ name }>
                  <div className="checkbox">
                    <Input data-value={ name }
                          id={`${name}-checkbox-${this.state.name}`}
                           disabled={ isAuthorized }
                           type="checkbox"
                           onChange={ this.onScopeChange }/>
                         <label htmlFor={`${name}-checkbox-${this.state.name}`}>
                           <span className="item"></span>
                           <div className="text">
                             <p className="name">{name}</p>
                             <p className="description">{description}</p>
                           </div>
                         </label>
                  </div>
                </Row>
              )
              }).toArray()
            }
          </div> : null
        }

        {
          errors.valueSeq().map( (error, key) => {
            return <AuthError error={ error }
                              key={ key }/>
          } )
        }
        <div className="auth-btn-wrapper">
        { isValid &&
          ( isAuthorized ? <Button className="btn modal-btn auth authorize" onClick={ this.logout }>Logout</Button>
        : <Button className="btn modal-btn auth authorize" onClick={ this.authorize }>Authorize</Button>
          )
        }
        </div>

      </div>
    )
  }
}
