const express = require('express')
const router = express.Router(); 
const jwt = require("jsonwebtoken")
const _ =require("lodash")
const { User } = require("../models/user")
const { auth } = require('../middleware/auth')
//const mailer = require("../components/nodemailer")
const { refreshSession } = require("../middleware/session")
router.get('/', auth, (req,res) => {
	return res.json({ message: 'What are you looking for!' })
})

router.get('/about', auth, (req,res) => {
	return res.json({ message: 'this is an application for optimizing parcel deliveries.' })
})

router.get('/contact-us-send-message', async (req,res) => {
	//todo validate email mobile name, message
	// save on db and show on app panel for the admins!
 	///await mailer(user.email, `'${user.userRole}' Access granted at ${process.env.APP_NAME}`, user, 'UsersRoleGranted')
	return res.json({ message: 'mailed' })
})

router.get('/me', async (req, res) => {
  try {
		const token = req.cookies["x-auth-token"]
		const decodedToken = jwt.verify(token, process.env.JWT_KEY)
		const result = await refreshSession(decodedToken.s, token)
		if (!result ) return res.send( {} )
		const user = await User.findOne( { _id: decodedToken._id })
		const me = _.pick( user, ["email", "name", "profilePhotoUrl", "userRole" ] )
		if  ( !_.isEqual(me, _.pick( decodedToken, ["email", "name", "profilePhotoUrl", "userRole" ] ))) {
			const newToken = user.generateAuthToken(decodedToken.s)
			res.cookie('x-auth-token', newToken, cookieOptions)
		}
		return res.send(me)
	} catch (_) {
		return res.send( {} )
	}
})

module.exports = router
