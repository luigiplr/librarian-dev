class IPFSComponent extends Component {

  static propTypes = {
    compact: React.PropTypes.bool.isRequired,
    installed: React.PropTypes.bool.isRequired,
    initializing: React.PropTypes.object,
    enabled: React.PropTypes.bool.isRequired,
    error: React.PropTypes.string
  }

  static defaltProps = {
    compact: true,
    installed: false,
    enabled: false
  }

  getStats() {
    const { stats } = this.props
    return (
      <div className="stats">
        <div className="row">
          <div className="col col-sm-6">
            <div className="peers">
              <object type="image/svg+xml" data="images/svg/business-16px_hierarchy-53.svg" className="logo"/>
              <span className="text">
                <strong>{stats.peers}</strong> peers connected
              </span>
            </div>
          </div>
          <div className="col col-sm-6">
            <div className="pinned">
              <object type="image/svg+xml" data="images/svg/location-16px_pin.svg" className="logo"/>
              <span className="text">
                <strong>{Object.keys(stats.pinned.total).length}</strong> files pinned
                <span className="muted">({stats.pinned.size})</span>
              </span>
            </div>
          </div>
          <div className="col col-sm-6">
            <div className="upload">
              <object type="image/svg+xml" data="images/svg/arrows-16px-1_tail-up.svg" className="logo"/>
              <span className="text">
                <strong>{stats.speed.up}</strong> uploading
                <span className="muted">({stats.bw.up})</span>
              </span>
            </div>
          </div>
          <div className="col col-sm-6">
            <div className="download">
              <object type="image/svg+xml" data="images/svg/arrows-16px-1_tail-down.svg" className="logo"/>
              <span className="text"><strong>{stats.speed.down}</strong> downloading
                <span className="muted">({stats.bw.down})</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  render() {
    const { enabled, installed, error, initializing, compact } = this.props
    return (
      <div className={`section ipfs ${enabled ? 'active' : ''}`}>
        <div className="clearfix">
          <div className="pull-left">
            <h4 className="title">IPFS</h4>
          </div>
          <div className="pull-right">
            <input onChange={this.handleChangeEnable}  type="checkbox" id="ipfs-toggle" className="toggle hidden" checked={enabled}/>
            <label htmlFor="ipfs-toggle" className="lbl"/>
          </div>
          {(initializing || error) ? (
            <div className="pull-right enabling">
              <span className={`label label-${error ? 'danger' : 'default-flash'}`}>{error ? error : 'Enabling ...'}</span>
            </div>
          ):null}
        </div>

        {initializing && !enabled ? <ProgressComponent {...initializing} /> : null}
        {enabled && !initializing ? this.getStats() : null}

        {!compact ? (
          <div className="detail">
            <p>The InterPlanetary File System (IPFS) is a new hypermedia distribution protocol, addressed by content and identities.
            IPFS enables the creation of completely distributed applications. It aims to make the web faster, safer, and more open.</p>
          </div>
        ) : null}
      </div>
    )
  }
}
