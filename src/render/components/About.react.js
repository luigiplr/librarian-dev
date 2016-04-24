class AboutPage extends Component {

  state = {
    license: '',
    contributors: [{
      name: 'Luigi Poole',
      github: 'luigiplr',
      email: 'luigipoole@outlook.com'
    }, {
      name: 'Skylar Ostler',
      github: 'ostlerdev',
      email: 'ostlerdev@me.com'
    }, {
      name: 'Dana Ast',
      github: 'dmxt',
      email: 'dana@dmxt.org'
    }]
  }

  componentWillMount() {
    fs.readFile('./LICENSE', 'utf8', (err, license = 'Error loading license') => this.mounted ? this.setState({ license }) : (this.state.license = license))
  }

  componentDidMount() {
    this.mounted = true
  }

  componentWillUnmount() {
    this.mounted = false
  }

  render() {
    const { contributors, license } = this.state

    return (
      <div className="col-lg-12">
        <div className="section about">
          <h4 className="title">About</h4>
          <p>ΛLΞXΛNDRIΛ Librarian v{remote.app.getVersion()} - "{packageJson.release.name}"</p>
          <p>This is a prototype developer build, and is not representative of the final product.</p>
          <p>Build Date: {packageJson.buildDate}</p>
        </div>
        <div className="section about contributors">
          <h4 className="title">Contributors</h4>
          {
            contributors.map(({github, email, name}, key) => (
              <p key={key}>
                {github ? (
                  <a onClick={() => shell.openExternal(`https://github.com/${github}`)} className="svg btn btn-github">
                    <object type="image/svg+xml" data="images/svg/social-16px_logo-github.svg"/>
                  </a>
                ) : null}
                {name} {email ? <span className="muted">{email}</span> : null}
              </p>
            ))
          }
        </div>
        <div className="section about license">
          <h4 className="title">License</h4>
          <div className="well license">
            {license}
          </div>
        </div>
      </div>
    )
  }
}
