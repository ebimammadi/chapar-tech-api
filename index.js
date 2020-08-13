require("dotenv/config")
const express = require("express")
const app = express()

require("./startup/security")(app)		// security, cookies & headers
require("./startup/logging")()				// logging
require("./startup/db")() 						// connection to mongoose 
require("./startup/routes")(app)			// routes 
require("./startup/config")()					// config
require("./startup/validation")()			// Joi validation

const port = process.env.PORT || 8080 
app.listen(port,() => console.log(`Listening on port ${port}...`) )
