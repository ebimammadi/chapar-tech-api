
const jwt = require('jsonwebtoken')

const supplierAuth = (req, res, next) => {
	const token = req.cookies["x-auth-token"]
	if (!token) return res.status(403).json({ message: '' })
  const { userRole } = jwt.verify(token, process.env.JWT_KEY)
  if ( userRole !== "admin" && userRole !== "supplier") 
    return res.status(403).json({ message: '' })
  next()
}

module.exports = supplierAuth
