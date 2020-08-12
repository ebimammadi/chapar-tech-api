const express = require('express')
const router = express.Router()

const homeRoutes = require("../routes/home")
const appUsersRoute = require("../routes/app-users")
const fileRoutes = require("../routes/files")
const appTicketRoutes = require("../routes/app-tickets")
const appProductsRoutes = require("../routes/app-products")

const error = require("../middleware/error")

module.exports = function(app) {

  app.use('/api', router)
  //Routes
  router.use('/', homeRoutes)
  router.use('/about', homeRoutes)
  router.use('/me', homeRoutes)
  router.use('/app-users', appUsersRoute)
  router.use('/files', fileRoutes)
  router.use('/app-tickets', appTicketRoutes)
  router.use('/app-products', appProductsRoutes)

  router.use( error)

}