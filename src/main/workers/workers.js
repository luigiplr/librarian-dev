/* common imports */
import socketClient from 'socket.io-client'

/* Worker imports */
import request from 'request'

const workers = {}
self.onmessage = ({ data }) => new workers[data.worker](data.port)
