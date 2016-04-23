class IPFSDaemon extends EventEmitter {
  constructor() {
    super()

    this.checkPATH()

    this.checkRunning()
  }

  dataPath = path.join(remote.app.getPath('appData'), remote.app.getName(), 'daemons', 'ipfs')

  api = null

  propData = {
    installed: false,
    execPath: undefined,
    enabled: false,
    checking: true,
    initializing: false,
    error: false,
    status: 'Searching for local installation',
    stats: {},
    task: {
      text: '',
      percent: 0
    }
  }

  updateProps(props) {
    this.propData = Object.assign(this.propData, props)
    this.emit('updated')
  }


  /* STATS */

  statsUpdateQueue = async.queue((task, next) => Promise.all([this._getPeers(), this._command('stats/bw')]).then(([peers, bandwidth]) => {
    this.updateProps({
      stats: {
        peers,
        bandwidth
      }
    })
    next()
  }).catch(() => next()))

  updateStats() {
    const { api } = this
    if (!api) this.updateProps({ enabled: false, stats: {}, task: {} })
    this.statsUpdateQueue.push()
  }

  _command = (cmd, args = null, opts = {}, qs = null) => new Promise((resolve, reject) => this.api.send(cmd, args, opts, qs, (err, [output]) => err ? reject(err) : resolve(output)))

  _getPeers = () => new Promise((resolve, reject) => this.api.swarm.peers((err, output) => err ? reject(err) : resolve(output.Strings)))


  /* CHECKING */

  checkCached() {
    log.info('Checking existence of IPFS in Librarian daemon store')

    if (fs.existsSync(this.dataPath)) {

    } else {
      log.warn('IPFS not found in Librarian daemon store')
      this.updateProps({ checking: false })
    }
  }

  checkRunning() {
    const api = ipfsAPI('/ip4/127.0.0.1/tcp/5001')

    api.version((err, { Version }) => {
      this.api = api
      log.info(`Found instance of IPFS v.${Version} running on port 5001`)
      this.updateProps({ enabled: true })
      this.updateStats()
    })
  }

  checkPATH() {
    log.info('Checking existence of IPFS in PATH')

    switch (process.platform) {
      case 'win32':
        exec('ipfs -v', (error, stdout, stderr) => {
          const outcome = !(error || (stdout || stderr).includes(`ipfs' is not recognized as an internal or external command`))
          if (!outcome) {
            log.warn('IPFS not found in PATH')
            this.checkCached()
          } else {
            log.info('IPFS found in PATH')
            this.updateProps({ checking: false })
          }
        })
        break
      case 'darwin':
        break
      case 'linux':
        break
    }
  }

  install() {

  }

  enable() {

  }
}
