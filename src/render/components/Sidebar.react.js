class AppSidebar extends Component {

  static propTypes = {
    changePage: React.PropTypes.func.isRequired,
    page: React.PropTypes.string.isRequired
  }

  tabs = ['Dashboard', 'Preferences', 'IPFS', 'About']

  _generateTab = (tab, key) => (
    <li key={key} onClick={() => this.props.changePage(tab)} className={(this.props.page === tab) ? 'active' : ''}>
      <a>{tab}</a>
    </li>
  )

  render = () => (
    <ul className="sidebar-nav">
      <li className="sidebar-brand">
        <object type="image/svg+xml" data="images/svg/logo-text.svg" className="logo"/>
      </li>
      {this.tabs.map(::this._generateTab)}
    </ul>
  )
}
