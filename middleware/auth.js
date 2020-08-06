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
		const user = new User(_.pick( decodedToken, ['name','email','_id','userRole','profilePhotoUrl']))
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

module.exports = auth
