
const express = require('express')

const helmet = require("helmet")
const cors = require("cors")
const bodyParser = require("body-parser")
const cookieParser = require("cookie-parser")
const { responseHeaderConfig } = require("../middleware/cookie")

module.exports = (app) => {
  //app.use( (req,res, next) => setTimeout(next, 1000)); //adds latency intentionally
  app.use(helmet())
  app.use(cors({ credentials: true, origin: process.env.APP_PATH }))
  app.use(express.json({ limit: '16mb' }))
  app.use(express.urlencoded({ limit: '16mb',extended: true }))
  app.use(bodyParser.json({ limit: '16mb' }))
  app.use(bodyParser.urlencoded({ limit: '16mb',extended: true }))
  app.use(cookieParser())
  app.use(responseHeaderConfig); //configures the header for requests  
  
  // TODO https://expressjs.com/en/advanced/best-practice-security.html block suspicious requests
} 