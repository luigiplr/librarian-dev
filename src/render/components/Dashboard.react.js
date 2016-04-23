class DashboardPage extends Component {
  render() {
    return (
      <div>
        <IPFSComponent compact={false} />
        <LogsComponent logs={''} />
      </div>
    )
  }
}
