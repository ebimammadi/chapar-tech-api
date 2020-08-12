const _ =require("lodash")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const sha256 = require("js-sha256")

const mailer = require("../../components/nodemailer")

const { cookieOptions } = require("../../middleware/cookie")
const { createSession, refreshSession, invalidateSessions } = require("../../middleware/session")
const { User, validateUser } = require("../../models/user")

const login = async (req, res) => {
  // validate post body payload (mail, password)
	const { error } = validateUser.login(req.body)
	if (error) return res.json({ message: error.details[0].message })
	let user = await User.findOne({ email: req.body.email })
	if (!user) return res.json({ message: `Invalid email or password.` })
	const validPassword = await bcrypt.compare(req.body.password, user.password)
	if (!validPassword) return res.json({ message: `Invalid email or password.` })
	if (!user.isActive) return res.json({ message: `Your account seems de-activated.` })
	const token = user.generateAuthToken()
	const { s } = jwt.verify(token, process.env.JWT_KEY)
	await createSession( {..._.pick(user, ['email', '_id']), token, session_id: s  })
	return res.header('x-auth-token', token)
		.cookie('x-auth-token', token, cookieOptions)
		.send( _.pick(user, ['name', 'email', 'profilePhotoUrl']) ); 
}

const register = async (req, res) => {
  // validate post body payload (name, email, password)
	if (!req.body.password) return res.send({ message:`'Password' is required.` })
	const { error } = validateUser.register(req.body)
	if (error) return res.json({ message: error.details[0].message })
	let user = await User.findOne({ email: req.body.email })
	if (user) return res.json({ message: `This email address is registered before.` })
	let slug = req.body.name.trim().toLowerCase().split(" ").join("-")	
	while(true){
		if (!await User.findOne({ slug })) break
		slug = slug + (Math.floor(Math.random() * 10) + 1) 
	}
	user = new User(_.pick(req.body, ['name','email','password']))
	user.password = await bcrypt.hash(user.password, await bcrypt.genSalt(10))
	user.slug = slug
	user.emailVerifyCode = sha256( user._id + Date.now())
	await user.save()
	await mailer(user.email,`Welcome to ${process.env.APP_NAME}`,user,'AuthRegister')
	// generate token
	const token = user.generateAuthToken()
	const { s } = jwt.verify(token, process.env.JWT_KEY)
	// create a session in db
	await createSession( {..._.pick(user, ['email', '_id']), token, status: 'Registered', session_id: s })
	return res.header('x-auth-token', token)
				.cookie('x-auth-token', token, cookieOptions)
				.send( _.pick(user, ['name', 'email', '_id']) )
}

const recoverPassword = async (req, res) => {
   // validate post body payload (password, code)
	if (!req.body.password) return res.status(400).json({ message: `Password is required.` })
	const { error } = validateUser.recover(req.body)
	if (error) return res.json({ message: error.details[0].message })
	let user = await User.findOne({ passwordRecoverCode: req.body.code })
	if (!user) return res.json({ message: `The link seems invalid.` })
	if (!user.isActive) return res.json({ message: 'Your account seems de-activated.' })
	const password = await bcrypt.hash(req.body.password, await bcrypt.genSalt(10))
	user.set({password: password ,passwordRecoverCode: '-' })
	await user.save()
	const token = user.generateAuthToken()
	const { s } = jwt.verify(token, process.env.JWT_KEY)
	await createSession( {..._.pick(user, ['email', '_id']), token, status: 'Recovered', session_id: s })
	await invalidateSessions(user._id, 'recover-password', s)
	return res.header('x-auth-token', token)
		.cookie('x-auth-token', token, cookieOptions)
		.send(_.pick(user, ['name', 'email', 'profilePhotoUrl'])); 
 }

const forgetPassword = async (req, res) => {
  // validate post body payload (email)
	const { error } = validateUser.forgetPassword(req.body)
	if (error) return res.json({ message: error.details[0].message })
	const user = await User.findOne({ email: req.body.email })
	if (!user) {
		//delay, if user tries to send unknown emails
		setTimeout( () => { return res.json({ message: `Invalid email` }); }, 5000 )
	}else {
		const uniqueID = sha256( user._id + Date.now())
		user.set({ passwordRecoverCode: uniqueID})
		await user.save()
		await mailer(req.body.email,'Recovery Link', uniqueID, 'AuthPasswordRecover')
		return res.json({ response_type: 'success', message: `Your request would be processed shortly. Please check your mailbox.` })
	}
}

const recoverPasswordVerifyCode = async (req, res) => {
  const code = req.params.code
	let user = await User.findOne({ passwordRecoverCode: code })
	if (!user) return res.json({ message: `The link seems invalid.` })
	return res.json({ email: user.email, response_type: `success`, message: `Set your new password.` })
}

const verifyEmail = async (req, res) => {
  const code = req.params.code
	const user = await User.findOne({ emailVerifyCode: code })
	if (!user) return res.json({ message: `The link seems invalid.` })
	user.set({ emailVerifyCode: `${Date.now()}`, emailVerify: true })
	await user.save()
	return res.json({ response_type:`success`, message: `Thank you for your confirmation.
				 Your Email has been verified successfully.` })
}

const logout = async (req, res) => {
	try {
		const token = req.cookies["x-auth-token"]
		const { s } = jwt.verify(token, process.env.JWT_KEY)
		await refreshSession(s, token, 'Signed-out')
		return res.clearCookie('x-auth-token').json({ message: 'ok'}); //header('x-auth-token', '-')
	} catch(err) {
		return res.clearCookie('x-auth-token').json({ message: err.message })
	}
}

module.exports = {
  login,
  register,
  recoverPassword,
  forgetPassword,
  recoverPasswordVerifyCode,
  verifyEmail,
  logout
}