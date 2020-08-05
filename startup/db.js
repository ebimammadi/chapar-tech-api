const mongoose = require("mongoose")
//todo use winston
module.exports = function() {
  mongoose.connect(process.env.DB_CONNECT, { useNewUrlParser: true, useUnifiedTopology: true } )
	  .then( () => console.log(`mongoDB connected ...`))
	//.catch( (err) => console.error(`Error connecting MongoDB...` ,err))
  mongoose.set('useCreateIndex', true)
}