class DashboardPage extends Component {

  static propTypes = {
    IPFSDaemon: React.PropTypes.object.isRequired
  }

  state = {
    ipfs: this.props.IPFSDaemon.propData
  }

  componentWillUnmount() {
    this.mounted = false
  }

  componentDidMount() {
    this.mounted = true
    const { IPFSDaemon } = this.props

    IPFSDaemon.on('updated', () => this.mounted && this.setState({ ipfs: IPFSDaemon.propData }))
  }

  render() {
    const { IPFSDaemon } = this.props
    const { ipfs } = this.state
    return (
      <div>
        <IPFSComponent {...ipfs} enable={IPFSDaemon.enable} compact={false} />
        <LogsComponent />
      </div>
    )
  }
}