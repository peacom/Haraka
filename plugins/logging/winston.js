'use strict'

const winston = require('winston')
const { AppConf } = require('./application')
const EventEmitter = require('events')

EventEmitter.defaultMaxListeners = 20

require('winston-daily-rotate-file')

const { format } = winston
const { combine, label, timestamp, printf } = format

const filter = format((info) => {
  const { message, stack } = info
  if (stack) {
    return { ...info, message: JSON.stringify(message), stack }
  }

  return { ...info, message: typeof info.message === 'object' ? JSON.stringify(info.message) : info.message }
})

const myFormat = printf(({ level, message, label: _label, timestamp: _timestamp, stack }) => {
  return `[${_timestamp}] [${_label.toUpperCase()}] [${level.toUpperCase()}]: ${message}${stack ? `. ${stack}` : ''}`
})

const container = new winston.Container()

function createFormat(_label) {
  return combine(timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }), label({ label: _label }), filter(), myFormat)
}

function createLoggerOptions(loggerName) {
  const rs = {
    format: createFormat(loggerName),
    transports: [
      new winston.transports.DailyRotateFile({
        filename: `${AppConf.logFile.folder}`.concat(`/${loggerName}-%DATE%.log`),
        datePattern: AppConf.logFile.datePattern,
        zippedArchive: AppConf.logFile.zippedArchive,
        handleExceptions: AppConf.logFile.handleExceptions,
        maxSize: AppConf.logFile.maxSize,
        maxFiles: AppConf.logFile.maxFiles,
        level: 'info',
      }),
    ],
  }

  if (process.env.NODE_ENV !== 'production') {
    rs.transports.push(
      new winston.transports.Console({
        level: 'debug',
        handleExceptions: true,
        json: false,
        colorize: true,
        format: myFormat,
      }),
    )
  }

  return rs
}

// container.add("database", createLoggerOptions("database"));

// container.add("http", createLoggerOptions("http"));

// container.add("app", {
//   ...createLoggerOptions("app"),
//   exceptionHandlers: [
//     new winston.transports.DailyRotateFile({
//       filename: `${AppConf.logFile.folder}`.concat("/exception-%DATE%.log"),
//       datePattern: AppConf.logFile.datePattern,
//       zippedArchive: AppConf.logFile.zippedArchive,
//       handleExceptions: AppConf.logFile.handleExceptions,
//       maxSize: AppConf.logFile.maxSize,
//       maxFiles: AppConf.logFile.maxFiles,
//       level: "info"
//     })
//   ]
// });

// container.add("db", createLoggerOptions("db"));
container.add('email', createLoggerOptions('email'))

// exports.httpLog = container.get("http");
// exports.appLog = container.get("app");
// exports.dbLog = container.get("db");
exports.emailLog = container.get('email')

// exports.httpStream = {
//   write: (message) => {
//     httpLog.info(message);
//   }
// };
