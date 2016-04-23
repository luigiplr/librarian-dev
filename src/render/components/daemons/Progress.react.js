class ProgressComponent extends Component {

  static propTypes = {
    percent: React.PropTypes.number.isRequired,
    text: React.PropTypes.string.isRequired
  }

  render() {
    const { percent, text } = this.props

    return (
      <div className="progress-container">
        <div className="row">
          <div className="col col-sm-6">
            <p>{text}</p>
          </div>
          <div className="col col-sm-6">
            <div className="progress">
              <div className="progress-bar -info" role="progressbar" aria-valuenow={percent} aria-valuemin="0" aria-valuemax="100" style={{width: `${percent}%`}}>
                <span className="sr-only">{percent}% Complete</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}
