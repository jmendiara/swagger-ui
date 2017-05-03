import React, { PropTypes } from "react"
import oauth2Authorize from "core/oauth2-authorize"

const IMPLICIT = "implicit"
const ACCESS_CODE = "accessCode"
const PASSWORD = "password"
const APPLICATION = "application"

export default class Oauth2 extends React.Component {
  static propTypes = {
    name: PropTypes.string,
    authorized: PropTypes.object,
    getComponent: PropTypes.func.isRequired,
    schema: PropTypes.object.isRequired,
    authSelectors: PropTypes.object.isRequired,
    authActions: PropTypes.object.isRequired,
    errSelectors: PropTypes.object.isRequired,
    errActions: PropTypes.object.isRequired,
    getConfigs: PropTypes.any
  }

  constructor(props, context) {
    super(props, context)
    let { name, schema, authorized } = this.props
    let auth = authorized && authorized.get(name)
    let username = auth && auth.get("username") || ""
    let clientId = auth && auth.get("clientId") || ""
    let clientSecret = auth && auth.get("clientSecret") || ""
    let passwordType = auth && auth.get("passwordType") || "basic"


    this.state = {
      name: name,
      schema: schema,
      scopes: [],
      apps: {},
      app: {
        name: "",
        clientId: "",
        clientSecret: ""
      },
      clientId: clientId,
      clientSecret: clientSecret,
      username: username,
      password: "",
      passwordType: passwordType
    }
  }

  componentDidMount() {
    let { authActions } = this.props
    authActions.getApps()
  }

  componentWillReceiveProps = (nextProps) => {
    let apps = nextProps.auth().get('apps')
    let app = apps[Object.keys(apps)[0]]
    this.setState({
      apps,
      app: Object.assign({}, app),
      clientId: app.clientId,
      clientSecret: app.clientSecret,
   })
  }

  onAppChange = (e) => {
    let app =  this.state.apps[e.target.value]
    this.setState({
      app: Object.assign({}, app),
      clientId: app.clientId,
      clientSecret: app.clientSecret,
    })
  }

  authorize =() => {
    let { authActions, errActions, getConfigs } = this.props
    let configs = getConfigs()

    errActions.clear({authId: name,type: "auth", source: "auth"})
    oauth2Authorize(this.state, authActions, errActions, configs)
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
    const Col = getComponent("Col")
    const Button = getComponent("Button")
    const AuthError = getComponent("authError")
    const JumpToPath = getComponent("JumpToPath", true)
    const Markdown = getComponent( "Markdown" )

    let flow = schema.get("flow")
    let scopes = schema.get("allowedScopes") || schema.get("scopes")
    let authorizedAuth = authSelectors.authorized().get(name)
    let isAuthorized = !!authorizedAuth
    let errors = errSelectors.allErrors().filter( err => err.get("authId") === name)
    let isValid = !errors.filter( err => err.get("source") === "validation").size

    return (
      <div>
        <h4>OAuth2.0 <JumpToPath path={[ "securityDefinitions", name ]} /></h4>
        <Markdown options={{html: true, typographer: true, linkify: true, linkTarget: "_blank"}}
                  source={ schema.get("description") } />

        { isAuthorized && <h6>Authorized</h6> }
        {
          flow !== PASSWORD ? null
            : <Row>
              <Row>
                <label htmlFor="oauth_username">username:</label>
                {
                  isAuthorized ? <code> { this.state.username } </code>
                    : <Col tablet={10} desktop={10}>
                      <input id="oauth_username" type="text" data-name="username" onChange={ this.onInputChange }/>
                    </Col>
                }
              </Row>
              {

              }
              <Row>
                <label htmlFor="oauth_password">password:</label>
                {
                  isAuthorized ? <code> ****** </code>
                    : <Col tablet={10} desktop={10}>
                      <input id="oauth_password" type="password" data-name="password" onChange={ this.onInputChange }/>
                    </Col>
                }
              </Row>
              <Row>
                <label htmlFor="password_type">type:</label>
                {
                  isAuthorized ? <code> { this.state.passwordType } </code>
                    : <Col tablet={10} desktop={10}>
                      <select id="password_type" data-name="passwordType" onChange={ this.onInputChange }>
                        <option value="basic">Basic auth</option>
                        <option value="request-body">Request body</option>
                        <option value="query">Query parameters</option>
                      </select>
                    </Col>
                }
              </Row>
            </Row>
        }
        {
          ( flow === APPLICATION || flow === IMPLICIT || flow === ACCESS_CODE || ( flow === PASSWORD && this.state.passwordType!== "basic") ) &&
          <Row>
            {
              isAuthorized ? <p> <b>{this.state.app.name} </b></p>
                           : <Col tablet={10} desktop={10}>
                               <label htmlFor="appSelector">Select one of your 4th platform applications:</label>
                               <select id="appSelector" style={{width:"100%"}} value={this.state.app.clientId} onChange={this.onAppChange}>
                                {
                                  Object.keys(this.state.apps).map(key => {
                                    return <option value={this.state.apps[key].clientId} key={this.state.apps[key].clientId}>{this.state.apps[key].name}</option>
                                  })
                                }
                               </select>
                             </Col>
            }
          </Row>
        }

        {
          !isAuthorized && scopes && scopes.size ? <div className="scopes">
            <h2>Scopes:</h2>
            { scopes.map((description, name) => {
              return (
                <Row key={ name }>
                  <div className="checkbox">
                    <Input data-value={ name }
                          id={`${name}-checkbox`}
                           disabled={ isAuthorized }
                           type="checkbox"
                           onChange={ this.onScopeChange }/>
                         <label htmlFor={`${name}-checkbox`}>
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
