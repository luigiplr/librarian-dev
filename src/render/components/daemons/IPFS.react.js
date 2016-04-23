class IPFSComponent extends Component {

  static propTypes = {
    compact: React.PropTypes.bool.isRequired,
    installed: React.PropTypes.bool.isRequired,
    initializing: React.PropTypes.bool.isRequired,
    enabled: React.PropTypes.bool.isRequired,
    error: React.PropTypes.string,
    info: React.PropTypes.string.isRequired,
    status: React.PropTypes.string.isRequired,
    stats: React.PropTypes.object.isRequired,

    enable: React.PropTypes.func.isRequired
  }

  state = this.props

  getStats() {
    const { stats, enabled } = this.props
    if (!stats || !enabled) return null

    console.log(stats)

    return (
      <div className="stats">
        <div className="row">
          {stats.peers ? (
            <div className="col col-sm-6">
              <div className="peers">
                <object type="image/svg+xml" data="images/svg/business-16px_hierarchy-53.svg" className="logo"/>
                <span className="text">
                  <strong>{stats.peers.length}</strong> peers connected
                </span>
              </div>
            </div>
          ): null}
          {stats.pinned ? (
            <div className="col col-sm-6">
              <div className="pinned">
                <object type="image/svg+xml" data="images/svg/location-16px_pin.svg" className="logo"/>
                <span className="text">
                  <strong>{Object.keys(stats.pinned.total).length}</strong> files pinned
                  <span className="muted">({stats.pinned.size})</span>
                </span>
              </div>
            </div>
          ): null}
          {stats.bandwidth ? (
            <div>
              <div className="col col-sm-6">
                <div className="upload">
                  <object type="image/svg+xml" data="images/svg/arrows-16px-1_tail-up.svg" className="logo"/>
                  <span className="text">
                    <strong>{`${bytes(stats.bandwidth.RateOut)}/s`}</strong> uploading
                    <span className="muted">({`${bytes(stats.bandwidth.TotalOut)}`})</span>
                  </span>
                </div>
              </div>
              <div className="col col-sm-6">
                <div className="download">
                  <object type="image/svg+xml" data="images/svg/arrows-16px-1_tail-down.svg" className="logo"/>
                  <span className="text"><strong>{`${bytes(stats.bandwidth.RateIn)}/s`}</strong> downloading
                    <span className="muted">({`${bytes(stats.bandwidth.TotalIn)}`})</span>
                  </span>
                </div>
              </div>
            </div>
          ): null}
        </div>
      </div>
    )
  }

  render() {
    const { enabled, installed, error, checking, initializing, compact, status, enable } = this.props
    return (
      <div className={`section ipfs ${enabled ? 'active' : ''}`}>
        <div className="clearfix">
          <div className="pull-left">
            <h4 className="title">IPFS</h4>
          </div>
          <div className="pull-right">
            <input onClick={enable} type="checkbox" className="toggle hidden" checked={enabled}/>
            <label htmlFor="ipfs-toggle" className="lbl"/>
          </div>
          {(checking || initializing || error) ? (
            <div className="pull-right enabling">
              <span className={`label label-${error ? 'danger' : 'default-flash'}`}>{error || status}</span>
            </div>
          ):null}
        </div>

        {enabled ? this.getStats() : null}

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
