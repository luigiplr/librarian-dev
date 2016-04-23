class IPFSDaemon extends EventEmitter {
  constructor() {
    super()

    mkdirp(path.join(this.dataPath))

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
    downloading: false,
    error: false,
    status: 'Searching for local installation',
    stats: {},
    task: false
  }


  /* Helper Functions */

  updateProps(props) {
    this.propData = Object.assign(this.propData, props)
    this.emit('updated')
  }


  /* Stats */

  updateStats = () => new Promise((resolve, reject) => {
    const { api } = this
    if (!api || !this.propData.enabled) {
      this.updateProps({ enabled: false, stats: {} })
      reject('DAEMON DISABLED')
    } else
      this._getAllStats().then(([peers, bandwidth, pinned, pinnedSize]) => this.updateProps({
        stats: {
          peers,
          bandwidth,
          pinned: {
            size: pinnedSize,
            files: pinned
          }
        }
      })).then(resolve).catch(() => {
        this.api = null
        this.updateProps({ enabled: false, stats: {} })
        reject('DAEMON HALTED')
        log.error('IPFS Daemon halted unexpectedly')
      })
  })

  _getAllStats = () => Promise.all([this._getPeers(), this._command('stats/bw'), this._getPinned(), this._getPinnedSize()])

  _command = (cmd, args = null, opts = {}, qs = null) => new Promise((resolve, reject) => this.api.send(cmd, args, opts, qs, (err, [output]) => err ? reject(err) : resolve(output)))

  _getPeers = () => new Promise((resolve, reject) => this.api.swarm.peers((err, { Strings }) => err ? reject(err) : resolve(Strings)))

  _getPinnedSize = () => new Promise((resolve, reject) => getFolderSize(path.join(process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'], '.ipfs/blocks'), (err, size) => err ? reject(err) : resolve(size)))

  _getPinned = () => new Promise((resolve, reject) => this.api.pin.list((err, { Keys }) => err ? reject(err) : resolve(Keys)))

  /* Checking */

  checkCached() {
    log.info('Checking existence of IPFS in Librarian daemon store')

    if (fs.existsSync(path.join(this.dataPath, `ipfs${process.platform === 'win32' ? '.exe' : ''}`))) {


    } else {
      log.warn('IPFS not found in Librarian daemon store')
      this.updateProps({ checking: false })
    }
  }

  checkRunning() {
    const api = ipfsAPI('/ip4/127.0.0.1/tcp/5001')
    api.version((err, data) => {
      if (err || !data) return
      this.api = api
      log.info(`Found instance of IPFS v.${data.Version} running on port 5001`)
      this.updateProps({ enabled: true })
      this.updateStats()
    })
  }

  checkPATH() {
    log.info('Checking existence of IPFS in PATH')

    switch (process.platform) {
      case 'win32':
        exec('ipfs -v', (error, stdout, stderr) => {
          const outcome = !(error || (stdout || stderr).toString().includes(`ipfs' is not recognized as an internal or external command`))
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

  /* Operations */

  download() {
    const { platform, arch } = process

    const downloadPath = path.join(this.dataPath, `ipfs${platform === 'win32' ? '.exe' : ''}.part`)
    const downloadURL = `https://github.com/dloa/alexandria-daemons/raw/master/bins/${platform}/ipfs${platform === 'win32' ? '.exe' : ''}`
    const download = new Downloader(downloadURL, downloadPath)

    this.updateProps({ downloading: true, status: 'Download Starting..' })

    download.on('progress', ({ speed, percentage, size }) => this.updateProps({
      task: {
        text: `${bytes(speed)}/s - ${bytes(size.transferred)} of ${bytes(size.total)}`,
        percent: percentage * 100
      },
      status: `Downloading.. ${Math.round(percentage * 100)}%`
    }))

    download.once('error', err => {
      download.removeAllListeners('progress')
      download.removeAllListeners('finish')
      console.error(err)
      this.updateProps({
        task: false,
        status: '',
        downloading: false,
        error: 'Download Failed'
      })
    })

    download.once('finish', () => {
      download.removeAllListeners('progress')
      download.removeAllListeners('error')
      this.updateProps({
        task: false,
        status: '',
        downloading: false
      })
      fs.renameSync(path.join(this.dataPath, `ipfs${platform === 'win32' ? '.exe' : ''}.part`), path.join(this.dataPath, `ipfs${platform === 'win32' ? '.exe' : ''}`))
    })
  }

  install() {
    this.download()
  }

  enable = () => {
    const { checking, installed } = this.propData
    if (checking) return

    if (installed) {


    } else {
      this.install()
    }
  }
}
