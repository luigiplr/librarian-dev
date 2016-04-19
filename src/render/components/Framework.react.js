class Framework extends Component {

  state = {
    daemonData: {},
    initializing: true,
    page: 'Dashboard'
  }

  componentDidMount() {
    Promise.all([this._initSettings(), this._initWorkers()]).then(() => this.setState({ initializing: false }))
  }

  _initWorkers = () => new Promise(resolve => {
    this.workers = new InitWorkers()
    this.workers.once('initiated', resolve)
  })

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

  _changePage = page => this.setState({ page })

  _getContents() {
    let Page = null
    switch (this.state.page.toLowerCase()) {
      case 'dashboard':
        Page = 'la'
        break
    }

    return (
      <div>
        <AppSidebar page={this.state.page} changePage={::this._changePage}/>
        {Page}
      </div>
    )
  }

  render = () => (
    <div className='app-framework'>
      {this.state.initializing ? this._getLoadingContents() : this._getContents()}
    </div>
  )
}
