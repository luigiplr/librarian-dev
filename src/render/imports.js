/* Electron */
import { shell, remote } from 'electron'

/* Node */
import { EventEmitter } from 'events'
import { exec, execFile } from 'child_process'
import path from 'path'
import fs from 'fs'

/* General */
import packageJson from '../package.json'
import minimist from 'minimist'
import async from 'async'
import { sync as mkdirp } from 'mkdirp'
import localforage from 'localforage'
import _ from 'lodash'
import bytes from 'bytes'
import getFolderSize from 'get-folder-size'
import request from 'request'
import requestProgress from 'request-progress'
import child from 'child'

/* Daemon */
import ipfsAPI from 'ipfs-api'

/* Logging */
import { Logger, transports } from 'winston'
import moment from 'moment'

/* React */
import React, { Component } from 'react'
import { render } from 'react-dom'
