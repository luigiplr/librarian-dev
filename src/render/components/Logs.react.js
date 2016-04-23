class LogsComponent extends Component {

  state = {
    logs: log.logs
  }

  mounted = false

  componentDidMount() {
    this.mounted = true
    log.on('newlog', () => this.mounted && this.setState({ logs: log.logs }))
  }

  componentWillUnmount() {
    this.mounted = false
    log.removeListener('newlog')
  }

  render() {
    return (
      <div className="section console">
        <h4 classNameName="title">Console Output</h4>
        <div className="console-output well">
          {
            this.state.logs.map(({level, message}) => <p><span className={level}>[{level}]</span>{message}</p>)
          }
        </div>
      </div>
    )
  }
}
