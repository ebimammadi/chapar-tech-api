
const jwt = require('jsonwebtoken')
const _ = require('lodash')

const adminAuth = (req, res, next) => {
	const token = req.cookies["x-auth-token"]
	if (!token) return res.status(403).json({ message: 'No valid token! Access denied.'})
  const { userRole } = jwt.verify(token, process.env.JWT_KEY)
  if ( userRole !== "admin" ) 
    return res.status(403).json({ message: `No Access, Access denied!` })
  next()
}

module.exports = adminAuth
