const winston = require("winston")

module.exports = (err, req, res, next) => {
	console.log(err)
	// error 
	// warn
	// info
	// http
	// verbose
	// debug
	// silly

	winston.error(err.message, err)
  res.status(500).send({ response_type: 'warning', message: `Error on server!`})
}