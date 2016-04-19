workers.daemon = class daemon {
  constructor(port) {
    if (!port) throw new Error('No worker port defined!')

    this.socket = socketClient(`http://127.0.0.1:${port}`)

    this.socket.on('connect', () => {
      this.log('Socket Connected!', 'info')
      this.socket.emit('initiated')
    })
    this.socket.on('disconnect', () => this.log('Socket Disconnected!', 'info'))

    this.initEvents()
  }

  log = (message, type = 'log') => this.socket.emit('info', {
    source: 'Daemon Worker',
    type,
    message
  })

  initEvents() {

  }
}
