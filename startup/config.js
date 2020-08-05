//const config = require("config")
//K0sbelIs@bEkon3inehIab
module.exports = function() {
  if (!process.env.JWT_KEY || process.env.JWT_KEY == "" ) 
    throw new Error(`Fatal Error: a config parameter is missing.`)
}