const winston = require("winston") 
require("winston-mongodb")
require("express-async-errors")

const connectionOptions = { 
  useNewUrlParser: true, 
  useUnifiedTopology: true 
}

module.exports = function() {

  process.on('uncaughtException', (ex) => {
    new winston.transports.Console({ colorize: true, prettyPrint: true })
    new winston.transports.File({ filename: 'log-file.log' })
    new winston.transports.MongoDB({ 
      db: process.env.DB_CONNECT, 
      options: connectionOptions, 
      level: 'silly' 
    })
    winston.log("We got an UNCAUGHT exception:", ex)
  })

  process.on('unhandledException', (ex) => {
    new winston.transports.Console({ colorize: true, prettyPrint: true })
    new winston.transports.File({ filename: 'log-file.log' })
    new winston.transports.MongoDB({ 
      db: process.env.DB_CONNECT, 
      options: connectionOptions, 
      level: 'silly' 
    })
    winston.log("We got an UNHANDLED exception:", ex)
  })

  winston.add( new winston.transports.Console({ colorize: true, prettyPrint: true }) )
  winston.add( new winston.transports.File({ filename: 'log-file.log' }) )
  winston.add( new winston.transports.MongoDB({ 
    db: process.env.DB_CONNECT, 
    options: connectionOptions,
    level: 'silly' 
  }))

}
