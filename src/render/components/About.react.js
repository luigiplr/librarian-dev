class AboutPage extends Component {

  static propTypes = {
    license: React.PropTypes.string,
    contributors: React.PropTypes.array
  }

  static defaultProps = {
    license: '',
    contributors: []
  }

  render() {
    const { contributors, license } = this.props

    return (
      <div className="col-lg-12">
        <div className="section about">
          <h4 className="title">About</h4>
          <p>ΛLΞXΛNDRIΛ Librarian v{remote.app.getVersion()}</p>
          <p>This is a prototype developer build, and is not representative of the final product.</p>
        </div>
        <div className="section about contributors">
          <h4 className="title">Contributors</h4>
          {
            contributors.map(({url, email, name}, key) => (
              <p key={key}>
                <a onClick={() => shell.openExternal(url)} className="svg btn btn-github">
                  <object type="image/svg+xml" data="images/svg/social-16px_logo-github.svg"/>
                </a>
                {name} <span className="muted">{email}</span>
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
