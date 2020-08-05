const express = require('express')
const router = express.Router()

const homeRoutes = require("../routes/home")
const coursesRoutes = require("../routes/courses")
const usersRoute = require("../routes/users")
const fileRoutes = require("../routes/files")
const ticketRoutes = require("../routes/tickets")

const error = require("../middleware/error")

module.exports = function(app) {

  app.use('/api', router)
  //Routes
  router.use('/', homeRoutes)
  router.use('/about', homeRoutes)
  router.use('/courses', coursesRoutes)
  router.use('/users', usersRoute)
  router.use('/files', fileRoutes)
  router.use('/tickets', ticketRoutes)

  router.use( error)

}