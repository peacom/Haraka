exports.AppConf = {
  hostname: '0.0.0.0',
  fileUploadDir: './uploads/',
  emailFileUploadDir: './public/uploads/',
  logFile: {
    folder: "logs/haraka",
    // folder: "/usr/projects/pm2/logs/haraka",
    errorFile: "error-%DATE%.log",
    datePattern: "YYYY-MM-DD",
    zippedArchive: false,
    handleExceptions: true,
    maxSize: '50m',
    maxFiles: '30',
  },
}
