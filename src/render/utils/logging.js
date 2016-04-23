/**
 * @desc initializes a winston instance w/ user options from config and creates instance logging directory
 * @param {string} level - log level passed to winston, can be any of: error, warn, info, verbose, debug, silly; defaults to debug
 * @return {object} instance - winston instance
 * @author Luigi Poole
 */

class logUtil extends Logger {
  constructor(level = 'debug') {
    //route logs to console for the one or two nano seconds it takes the code below to run
    super({ level, exitOnError: false })

    //assign logPath to os appdata + app name + logs
    const logPath = path.join(remote.app.getPath('appData'), remote.app.getName(), 'logs')

    //create the logging path if it does not already exsist. (do this synchronously)
    mkdirp(logPath)

    //route uncaught errors within the app to winston for logging
    process.on('uncaughtException', this.error)

    //now that the logging path has been created finnish configuring winston
    this.configure({
      level,
      transports: [
        new(transports.Console)({
          colorize: true,
          json: false
        }),
        new(transports.File)({
          filename: path.join(logPath, `${moment().format('YYYY-MM-DD_HH-MM-SS-MS')}.log`),
          prettyPrint: true
        })
      ],
      exitOnError: false
    })

    this.stream().on('log', ({ level, message, timestamp }) => {
      console[(level === 'error' || level === 'warn' || level === 'info') ? level : 'log'](`[${level}] ${message}`)
      this.logs.push({ level, message, timestamp })
      this.emit('newlog')
    })
  }

  logs = []
}

const log = new logUtil()
