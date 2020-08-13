const winston = require("winston")

module.exports = (err, req, res, next) => {
	winston.error(err.message, err)
  res.status(500).send({ 
		response_type: 'warning', 
		message: `Error on server!`, 
		more_info: err.message.slice(0,100)+'..., for more info, check logs!' })
}