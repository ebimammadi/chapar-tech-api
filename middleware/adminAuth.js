
const jwt = require('jsonwebtoken')

const adminAuth = (req, res, next) => {
	const token = req.cookies["x-auth-token"]
	if (!token) return res.status(403).json({ message: '' })
  const { userRole } = jwt.verify(token, process.env.JWT_KEY)
  if ( userRole !== "admin" ) 
    return res.status(403).json({ message: '' })
  next()
}

module.exports = adminAuth
