const jwt = require("jsonwebtoken")
const _ = require("lodash")
const { User } = require("../models/user")
const { refreshSession } = require("../middleware/session")
const { cookieOptions } = require("../middleware/cookie")

const auth = async(req, res, next) => {
	const token = req.cookies["x-auth-token"]
	if (!token) return res.status(403).json({ message: ''})
	try {
		const decodedToken = jwt.verify(token, process.env.JWT_KEY)		
		const user = new User(_.pick( decodedToken, ['name','email','_id','userRole', 'slug','profilePhotoUrl']))
		const newToken = user.generateAuthToken(decodedToken.s)
		const session = await refreshSession(decodedToken.s, newToken)		
		if (!session) return res.status(403).json({ message: ''})
		res.cookie('x-auth-token', newToken, cookieOptions)
		next()
	} 
	catch (ex) {
		return res.status(403).json({ message: ''})
	}
}

const adminAuth = (req, res, next) => {
	const token = req.cookies["x-auth-token"]
	if (!token) return res.status(403).json({ message: '' })
  const { userRole } = jwt.verify(token, process.env.JWT_KEY)
  if ( userRole !== "admin" ) 
    return res.status(403).json({ message: '' })
  next()
}

const supplierAuth = (req, res, next) => {
	const token = req.cookies["x-auth-token"]
	if (!token) return res.status(403).json({ message: '' })
  const { userRole } = jwt.verify(token, process.env.JWT_KEY)
  if ( userRole !== "admin" && userRole !== "supplier") 
    return res.status(403).json({ message: '' })
  next()
}

module.exports = { auth, adminAuth, supplierAuth }
