const _ =require("lodash")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const sha256 = require("js-sha256")
// const mongoose = require("mongoose")

const mailer = require("../../components/nodemailer")
const { utcNow } = require("../../components/lib")
const { invalidateSessions } = require("../../middleware/session")
const { sendSms, logSmsInDb } = require("../../components/sms") //todo logSmsInDb
const { User, validateUser } = require("../../models/user")

const profileGet = async (req, res) => {
  const { _id } = jwt.verify(req.cookies["x-auth-token"], process.env.JWT_KEY)
	const user =  await User.findById(_id).select('-password -passwordRecoverCode -__v')
	const profile = user 
	profile.emailVerify = user.emailVerify.startsWith('true') 
	profile.mobileVerify = user.mobileVerify.startsWith('true')
	if (profile.urls.facebook === undefined) profile.urls = { facebook: '', instagram: '', website: '' }
	return res.send(profile)
}

const profileSet = async (req, res) => {
  // validate post body payload (name, slug, urls)
	const { error } = validateUser.profileSet(req.body)
	if (error) return res.json({ message: error.details[0].message })
	
	
	const { _id } = jwt.verify(req.cookies["x-auth-token"], process.env.JWT_KEY)
	// check for unique slug
	const checkUser = await User.find( { slug: req.body.slug, _id: { $ne: _id} } )
	if (checkUser.length>0) return res.json({ message: `This slug is in use.` })
	
	const user = await User.findById(_id)
	user.set({ name: req.body.name, urls: req.body.urls, slug: req.body.slug })
	await user.save()
	return res.send({ response_type: 'success', message: `Profile Updated.` });//user)
}

const emailSet = async (req, res) => {
  // validate post body payload (email, password)
	const { error } = validateUser.emailSet(req.body)
	if (error) return res.json({ message: error.details[0].message })
	
	const newEmail = req.body.email

	const { _id } = jwt.verify(req.cookies["x-auth-token"], process.env.JWT_KEY)
	let user = await User.findById( _id )	
	if ( user.email == newEmail ) return res.json({ response_type: 'warning', message: `This is your current email.`})
	const validPassword = await bcrypt.compare(req.body.password, user.password)
	if (!validPassword) return res.json({ message: `Invalid password.` })

	const checkUser = await User.find( { email: newEmail } )
	if (checkUser.length>0) return res.json({ response_type: 'warning', message: `This email is in use.`})
	
	//send warning notification to the previous email 
	await mailer(user.email,'Warning! Email changed.', { name: user.name } , 'emailChangeWarningTemplate')
	//generate the verify link
	user.emailVerify = sha256( user._id + Date.now())
	user.email = newEmail
	await user.save()
	//send verify link for the new email 
	await mailer(user.email,`Changed 'User Email' at ${process.env.APP_NAME}`,user,'emailChangeVerifyTemplate')
	return res.send({ response_type: 'success', message: `Your email has been updated, please check your mailbox for verification.` })
}

const mobileSet = async (req, res) => {
	// validate post body payload (mobile, password)
	const { error } = validateUser.mobileSet(req.body)
	if (error) return res.json({ message: error.details[0].message })

	const { _id } = jwt.verify(req.cookies["x-auth-token"], process.env.JWT_KEY)
	const mobile = req.body.mobile
	let user = await User.findById( _id )
	if ( user.mobile == mobile ) return res.json({ message: `This is your current mobile.`})

	const validPassword = await bcrypt.compare(req.body.password, user.password)
	if (!validPassword) return res.json({ message: 'Invalid password.' })

	const checkUser = await User.find( { mobile } )
	if (checkUser.length>0) return res.json({ message: `This mobile is in use.`})

	//generate code
	const verifyCode = Math.floor(1000 + Math.random() * 9000)
	const number = "0046" + mobile.slice(1)
	const message = `Your verification code is ${verifyCode}.`
	const sms = await sendSms( number, message) 
	user.mobileVerify = verifyCode
	user.mobile = mobile
	await user.save()

	//await logSmsInDb(number, message, sms)//! if sms fails ?!
	if (sms.response.statusCode === 200	)
		return res.send({ response_type: 'success', message: `Your mobile has been updated, 
			please input your received verification code.` })
}

const passwordSet = async (req, res) => {
  // validate post body payload (newPassword, password)
	if (!req.body.newPassword) return res.json({ message: `New password is required.` })
	const { error } = validateUser.passwordSet(req.body)
	if (error) return res.json({ message: error.details[0].message })
	const token = req.cookies["x-auth-token"]
	const decodedToken = jwt.verify( token, process.env.JWT_KEY)
	const user = await User.findById( decodedToken._id )
	if (!user) return res.json({ message: `Error! Invalid password!` })
	
	const validPassword = await bcrypt.compare(req.body.password, user.password)
	if (!validPassword) return res.json({ message: `Invalid password.` })

	const password = await bcrypt.hash(req.body.newPassword, await bcrypt.genSalt(10))
	user.set({ password })
	await user.save()

	//! TODO expire other sessions which are signed in and active
	console.log(`result`,await invalidateSessions(decodedToken._id, 'password-changed', decodedToken.s))
//	console.log(`result`,await invalidateSessions(decodedToken._id, 'password-changed', decodedToken.s))

	//send verify link for the new email 
	await mailer(user.email,`Change password notice at ${process.env.APP_NAME}`,user,'passwordChangeTemplate')
	return res.send({ response_type: 'success', message: `Your password has been changed successfully.` })
}

const sendVerificationLink = async (req, res) => {
  const { _id } = jwt.verify(req.cookies["x-auth-token"], process.env.JWT_KEY)
	const user = await User.findById(_id)
	user.emailVerify = sha256( user._id + Date.now()); 
	await user.save()
	await mailer(user.email,`Confirm your email at ${process.env.APP_NAME}`,user,'userEmailVerifyTemplate')
  return res.json({ response_type:`success`, message: `Verification code 
          has been sent to your mail account. Please check your mailbox.` })
}

const sendVerificationSms = async (req, res) => {
	// validate post body payload (mobile)
	const { error } = validateUser.verificationSms(req.body)
	if (error) return res.json({ message: error.details[0].message })

	const mobile = req.body.mobile
	const { _id } = jwt.verify(req.cookies["x-auth-token"], process.env.JWT_KEY)
	const user = await User.findById(_id)
	if (user.mobile != mobile) return res.json({ message: `Your mobile number seems invalid.`})

	const verifyCode = Math.floor(1000 + Math.random() * 9000)
	const number = "0046" + mobile.slice(1)
	const message = `Your verification code is ${verifyCode}.`
	const sms = await sendSms( number, message) 
	user.mobileVerify = verifyCode
	await user.save()
	//? Todo logs to db
	//await logSmsInDb("0046732440940", "Hello !!! https://chapar.techSSASSS", sms.toString())
	if (sms.response.statusCode === 200	)
		return res.send({ response_type: 'success', message: `Please input your received verification code.` })
}

const receiveVerificationCode = async (req, res) => {
	// validate post body payload (mobile, code)
	const { error } = validateUser.receiveVerificationCode(req.body)
	if (error) return res.json({ message: error.details[0].message })
	const mobile = req.body.mobile

	const { _id } = jwt.verify(req.cookies["x-auth-token"], process.env.JWT_KEY)
	const user = await User.findById(_id)
	if (user.mobile != mobile) return res.json({ message: `Your mobile number seems invalid.`})
	if (user.mobileVerify != req.body.code) return res.json({ message: `Your provided code seems invalid.`})
	
	user.mobileVerify = `true-${utcNow()}`
	await user.save()
		
	return res.send({ response_type: 'success', message: `Your mobile number is verified successfully.` })
	
}

const sendRequestSupplier = async (req, res) => {
	// validate post body payload (_id)
	const { error } = validateUser.idValidate(req.body)
	if (error) return res.json({ message: error.details[0].message })

	const _id = req.body._id
	const user = await User.findById(_id)
	const previous = user.setRoleStatusPrevious()
	user.roleStatus = { status: 'pending', date: utcNow(), previous }
	await user.save()

	let admins = await User.find({ userRole: `admin` })
  for (let i=0; i < admins.length ; i++ ){
    await mailer(admins[i].email,`Supplier request for [${user.email}]`,user,'supplierRequestAdminTemplate')
	}
	await mailer(user.email,`Supplier request received at ${process.env.APP_NAME} `,user,'supplierRequestTemplate')
		
	return res.send({ response_type: 'success', message: `Your supplier request has been received and would be proceeding very soon. 
		Thank you for your patience.`, roleStatus: user.roleStatus })
}

module.exports = {
  profileGet,
  profileSet,
	emailSet,
	mobileSet,
  passwordSet,
  sendVerificationLink,
	sendVerificationSms,
	receiveVerificationCode,
	sendRequestSupplier
}