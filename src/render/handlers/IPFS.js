class IPFSDaemon extends EventEmitter {
  constructor() {
    super()

    this.checkPATH()
  }

  dataPath = path.join(remote.app.getPath('appData'), remote.app.getName(), 'daemons', 'ipfs')
  installed = false
  execPath = undefined
  enabled = false
  checking = true

  get PropData() {
    const { execPath, installed, checking, enabled } = this
    return {
      installed,
      execPath,
      checking,
      enabled
    }
  }

  checkCached() {
    log.info('Checking existence of IPFS in Librarian daemon store')

    if (fs.existsSync(this.dataPath)) {

    } else {
      log.warn('IPFS not found in Librarian daemon store')
      this.checking = false
      this.emit('checking', false)
    }
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
            this.checking = false
            this.emit('checking', false)
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
