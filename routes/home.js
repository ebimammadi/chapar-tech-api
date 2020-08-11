const express = require('express')
const router = express.Router(); 

const auth = require('../middleware/auth')
const mailer = require("../../components/nodemailer")

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

module.exports = router
