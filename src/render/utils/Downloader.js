class Downloader extends EventEmitter {
  constructor(downloadURL, downloadPath) {
    super()
    this._download(downloadURL, downloadPath)
  }

  _download = (downloadURL, downloadPath) => requestProgress(request(downloadURL), {
      throttle: 100,
      delay: 10,
    })
    .on('progress', ({ speed, percentage, size }) => this.emit('progress', { speed, percentage, size }))
    .on('error', err => this.emit('error', err))
    .pipe(fs.createWriteStream(downloadPath))
    .on('finish', () => this.emit('finish'))
}
