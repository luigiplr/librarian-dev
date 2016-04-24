class IPFSDaemon extends EventEmitter {
  constructor() {
    super()

    this.dataPath = path.join(remote.app.getPath('appData'), remote.app.getName(), 'daemons', 'ipfs')
    this.defaultExecPath = path.join(this.dataPath, `ipfs${process.platform === 'win32' ? '.exe' : ''}`)

    mkdirp(this.dataPath)

    this.checkPATH()
    this.checkRunning()
  }

  api = null
  daemon = null
  execPath = false

  propData = {
    installed: false,
    execPath: this.execPath,
    enabled: false,
    checking: true,
    initializing: false,
    downloading: false,
    error: false,
    status: 'Searching for local installation',
    stats: {},
    task: false,
    disabled: false
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
        this.updateProps({ enabled: false, stats: {} })
        this.api = null
        log.error('IPFS Daemon halted unexpectedly')
        reject('DAEMON HALTED')
      })
  })

  _getAllStats = () => Promise.all([this._getPeers(), this._command('stats/bw'), this._getPinned(), this._getPinnedSize()])

  _command = (cmd, args = null, opts = {}, qs = null) => new Promise((resolve, reject) => this.api.send(cmd, args, opts, qs, (err, [output]) => err ? reject(err) : resolve(output)))

  _getPeers = () => new Promise((resolve, reject) => this.api.swarm.peers((err, { Strings }) => err ? reject(err) : resolve(Strings)))

  _getPinnedSize = () => new Promise((resolve, reject) => getFolderSize(path.join(process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'], '.ipfs/blocks'), (err, size) => err ? reject(err) : resolve(size)))

  _getPinned = () => new Promise((resolve, reject) => this.api.pin.list((err, { Keys }) => err ? reject(err) : resolve(Keys)))

  /* Checking */

  checkExec = execPath => new Promise((resolve, reject) => execFile(execPath, ['version'], {
    cwd: this.dataPath
  }, (error, stdout, stderr) => (!error && stdout.toString().includes('ipfs version')) ? resolve() : reject(error || stderr)))

  checkCached() {
    log.info('Checking existence of IPFS in Librarian daemon store')

    if (fs.existsSync(this.defaultExecPath)) {
      this.checkExec(this.defaultExecPath)
        .then(() => {
          log.info('IPFS found in Librarian daemon store')
          this.execPath = this.defaultExecPath
          this.updateProps({ checking: false, installed: true })
        })
        .catch(err => {
          console.log(err)
          log.error('Corrupt IPFS found in Librarian daemon store; Removing..')
          fs.unlink(path.join(this.dataPath, `ipfs${process.platform === 'win32' ? '.exe' : ''}`))
          this.updateProps({ checking: false })
        })
    } else {
      log.warn('IPFS not found in Librarian daemon store')
      this.updateProps({ checking: false })
    }
  }

  checkRunning() {
    const api = ipfsAPI('/ip4/127.0.0.1/tcp/5001')
    api.version((err, data) => {
      if (err || !data) return
      const { Version } = data
      if (semver.gte(Version, '0.4.0')) {
        this.api = api
        log.info(`Found instance of IPFS v.${Version} running on port 5001`)
        this.updateProps({ enabled: true })
        this.updateStats()
      } else {
        log.error(`Incompatible instance of IPFS (v.${Version}) running on port 5001, Please upgrade to 0.4.0+`)
        this.updateProps({ error: 'Incompatible instance detected', disabled: true })
      }
    })
  }

  checkPATH() {
    log.info('Checking existence of IPFS in PATH')

    switch (process.platform) {
      case 'win32':
        exec('ipfs version', (error, stdout, stderr) => {
          const outcome = !(error || (stdout || stderr).toString().includes(`ipfs' is not recognized as an internal or external command`))
          if (!outcome) {
            log.warn('IPFS not found in PATH; Checking daemon store...')
            this.checkCached()
          } else {
            log.info('IPFS found in PATH')
            this.execPath = 'ipfs'
            this.updateProps({ checking: false, installed: true })
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

    const downloadPath = this.defaultExecPath + '.part'
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
      this.install()
    })
  }

  install() {
    log.info('Installing IPFS Daemon')

    fs.renameSync(this.defaultExecPath + '.part', this.defaultExecPath)
    fs.chmodSync(this.defaultExecPath, '755')

    execFile(this.defaultExecPath, ['init'], {
      cwd: this.dataPath
    }, (error, stdout, stderr) => {
      log.verbose(error || stdout)

      this.updateProps({ installed: true, execPath: this.defaultExecPath })
      this.enable()
    })
  }

  enable = () => {
    const { checking, installed, enabled, disabled } = this.propData
    if (checking || enabled || disabled) return

    log.info('Enabling IPFS Daemon')

    if (installed) {
      this.start()
    } else {
      log.info('Local IPFS Daemon unfound; Downloading..')
      this.download()
    }
  }

  disable = () => {

    console.log('disabling')
    if (this.daemon) {
      this.updateProps({ enabled: false })
      this.daemon.stop()
      this.api = null
    }
  }

  start() {
    const { execPath, dataPath, defaultExecPath } = this
    const command = execPath || defaultExecPath
    let enableTriggered = false
    let disabledTriggered = false

    log.info(`Starting IPFS Daemon from ${command === 'ipfs' ? 'PATH' : command}`)
    this.updateProps({ status: 'Initializing..', initializing: true })

    const outputParser = output => {
      if (!enableTriggered && output.includes('Daemon is ready')) {
        enableTriggered = true
        this.api = ipfsAPI('/ip4/127.0.0.1/tcp/5001')
        this.updateProps({ enabled: true, initializing: false, status: '' })
        this.updateStats()
      }
      if (enableTriggered && !disabledTriggered) {

      }
    }

    this.daemon = child({
      command,
      args: ['daemon'],
      options: {
        detached: false,
        cwd: dataPath,
        env: process.env
      },
      autoRestart: false,
      cbRestart: pid => console.log(`IPFS restarting with PID: ${pid}`),
      cbStdout: data => {
        log.verbose(`IPFS: ${data.toString()}`)
        outputParser(data.toString())
      },
      cbStderr: data => {
        log.verbose(`IPFS: ${data.toString()}`)
        outputParser(data.toString())
      },
      cbClose: exitCode => {
        log.verbose(`IPFS Exiting with code ${exitCode.toString()}`)
      }
    })

    this.daemon.start()
  }
}
