const winston = require("winston") // TODO: improve log reporting on an external file or mongodb storage
//require("winston-mongodb")
require("express-async-errors")

module.exports = function() {

  process.on('uncaughtException', (ex) => {
    //ew winston.transports.Console( { colorize: true, prettyPrint: true })
    new winston.transports.File( { filename: 'logs-uncaught-unhandled.log' })
    console.log("We got an UNCAUGHT exception:", ex)
    //winston.log("We got an UNCAUGHT exception:", ex)
  })

  process.on('unhandledException', (ex) => {
    //new winston.transports.Console( { colorize: true, prettyPrint: true })
    new winston.transports.File( { filename: 'logs-uncaught-unhandled.log' })
    console.log("We got an UNHANDLED exception:", ex)
    // winston.log("We got an UNHANDLED exception:", ex)
  })

  winston.add( new winston.transports.File( { filename: 'log-file.log' }) )
  //winston.add( winston.transports.MongoDB, { db: process.env.DB_CONNECT, level: 'silly'} )

}
