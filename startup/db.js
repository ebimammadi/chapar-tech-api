const mongoose = require("mongoose")
const winston = require("winston")

const connectionOptions = { 
  useNewUrlParser: true, 
  useUnifiedTopology: true 
}

module.exports = function() {
  mongoose.connect(process.env.DB_CONNECT, connectionOptions )
	  .then( () => console.log(`MongoDB connected`))
	  .catch( (err) => winston.error(`Error connecting MongoDB:` ,err))
  mongoose.set('useCreateIndex', true)
}