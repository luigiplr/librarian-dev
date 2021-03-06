class Framework extends Component {

  state = {
    daemonData: {},
    initializing: true,
    page: 'Dashboard',

    /* About */
    license: '',
    contributors: []
  }

  componentWillMount() {
    /* Create local daemon store if not exsists */
    mkdirp(path.join(remote.app.getPath('appData'), remote.app.getName(), 'daemons'))
  }

  componentDidMount() {
    this.mounted = true
    log.info(`Librarian initializing..`)

    this._initSettings().then(() => {
      this._initDaemonHandlers()
      this.setState({ initializing: false })
    })
  }

  _initDaemonHandlers() {
    this.IPFSDaemon = new IPFSDaemon()
  }

  _initSettings = () => new Promise(resolve => {
    this.settingsStore = new Settings()
    this.settingsStore.once('initiated', resolve)
  })

  _getLoadingContents() {
    return (
      <div className="loading-spinner-wrapper">

      </div>
    )
  }

  _getContents() {
    const { page, license, contributors } = this.state
    let Page = null
    switch (page.toLowerCase()) {
      case 'dashboard':
        Page = <DashboardPage IPFSDaemon={this.IPFSDaemon} />
        break
      case 'preferences':
        Page = null
        break
      case 'ipfs':
        Page = null
        break
      case 'about':
        Page = <AboutPage />
        break
    }

    return (
      <div>
        <AppSidebar page={this.state.page} changePage={page => this.setState({ page })}/>
        <div id="content" className="dashboard">
          <div className="container-fluid">
            <div className="row">
              {Page}
            </div>
          </div>
        </div>
      </div>
    )
  }
  render = () => this.state.initializing ? this._getLoadingContents() : this._getContents()
}
