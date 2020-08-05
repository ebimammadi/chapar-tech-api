const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const Joi = require('joi')
const passwordComplexity = require('joi-password-complexity')
const _ = require('lodash')
const sha256 = require('js-sha256')
const { regexUrl, regexSlug } = require('../components/lib')

const validUserRoles = [ 'user', 'admin', 'supplier' ]

const passwordComplexityOptions = {
	required: true,
	min: 8,
	max: 255,
	lowerCase: 1,
	upperCase: 1,
	numeric: 1,
	symbol: 1,
	requirementCount: 4
}

//schema validate mongoose
const userSchema = new mongoose.Schema({
	name: { 
		type: String, 
		required: true, 
		minlength: 5, 
		maxlength: 255 
	},
	email: { 
		type: String, 
		required: true, 
		unique: true 
	},
	password: { 
		type: String, 
		required: true, 
		minlength: 5, 
		maxlength: 1024 
	},
	date: { 
		type: Date,
		default: Date.now
	},
	isActive: { 
		type: Boolean, 
		default: true 
	},
	userRole: { 
		type: String, 
		enum: validUserRoles,
		default: 'user'  
	},
	emailVerify: {
		type: String, 
		default: 'false'
	},
	passwordRecoverCode: {
		type: String, 
		default: '-'
	},
	profilePhotoUrl: {
		type: String,
		default: ''
	},
	mobile: {
		type: String,
		unique: true
	},
	mobileVerify: {
		type: String, 
		default: 'false'
	},
	urls: {
		facebook: { type: String, default: '' },
		instagram: { type: String, default: '' },
		website: { type: String, default: '' }
	},
	slug: {
		type: String,
		unique: true
	},
	roleStatus: {
		status: { type: String, default: '' },
		date: { type: Date, default: Date.now },
		previous: { type: String, default: '' }
	}
})

userSchema.methods.generateAuthToken = function(session_id) {
	const payload = _.pick(this, ['email','name','_id','userRole','profilePhotoUrl'])
	payload.s = (session_id) ? session_id: sha256( this._id + Date.now() ) //note: how this works! ;)
	payload.exp = Math.floor(Date.now() / 1000) + (parseFloat(process.env.JWT_EXP_HOUR) * 3600)
	return jwt.sign( payload, process.env.JWT_KEY )
}

userSchema.methods.setRoleStatusPrevious = function() {
	if (this.roleStatus.previous !== "")
	return this.roleStatus.previous + '$' + this.roleStatus.status +','+ this.roleStatus.status
	return this.roleStatus.status +','+ this.roleStatus.status
}

//model
const User = mongoose.model('User', userSchema)

const userRegisterValidate = (user) => {    
	const schema = Joi.object({
		name: Joi.string().required().min(5).max(255),
		email: Joi.string().email().required().min(5).max(255),
		password: passwordComplexity( passwordComplexityOptions )
	})
	return schema.validate(user)
}
const userLoginValidate = (user) => {    
	const schema = Joi.object({
			email: Joi.string().email().required().min(5).max(255),
			password: Joi.string().required().min(8).max(255),
	})
	return schema.validate(user)
}
const userRecoverValidate = (user) => {    
	const schema = Joi.object({
		code: Joi.string().required().min(36),
		password: passwordComplexity( passwordComplexityOptions ) 
	})
	return schema.validate(user)
}
const userProfileSetValidate = (user) => {
	const schema = Joi.object({
		name: Joi.string().required().min(5),
		slug: Joi.string().required().regex(regexSlug),
		urls: {
			website: Joi.string().allow('').regex(regexUrl),
			facebook: Joi.string().allow('').regex(regexUrl),
			instagram: Joi.string().allow('').regex(regexUrl),
		}
	})
	return schema.validate(user)
}
const userEmailSetValidate = (user) => {
	const schema = Joi.object({
		email: Joi.string().email().required().min(5).max(255),
		password: Joi.string().required().min(5).max(255)
	})
	return schema.validate(user)
}
const userMobileSetValidate = (user) => {
	const schema = Joi.object({
		mobile: Joi.string().required().min(10).max(15),
		password: Joi.string().required().min(5).max(255)
	})
	return schema.validate(user)
}
const userPasswordValidate = (user) => {
	const schema = Joi.object({
		password: Joi.string().required().min(5).max(255),
		newPassword: passwordComplexity( passwordComplexityOptions )
	})
	return schema.validate(user)
}
const UserRoleValidate = (user) => {
	const schema = Joi.object({
		_id: Joi.string().required().min(5).max(255),
		userRole: Joi.string().required().valid( ...validUserRoles ) //!check
	})
	return schema.validate(user)
} 
const emailValidate = (user) => {
	const schema = Joi.object({
		email: Joi.string().required().email(),
	})
	return schema.validate(user)
} 
const UserForgetPasswordValidate = (user) => {
	const schema = Joi.object({
		email: Joi.string().required().email(),
	})
	return schema.validate(user)
}
const UserListValidate = (user) => {
	const schema = Joi.object({
		page: Joi.number().integer(),
		userRole: Joi.string().allow('').valid( ...validUserRoles ),
		search: Joi.string().allow('').max(64)
	})
	return schema.validate(user)
}
const VerificationSmsValidate = (user) => {
	const schema = Joi.object({
		mobile: Joi.string().regex(/^\d+$/).min(10).max(10)
	})
	return schema.validate(user)
}
const ReceiveVerificationCodeValidate = (user) => {
	const schema = Joi.object({
		mobile: Joi.string().min(10).max(10).regex(/^\d+$/),
		code: Joi.string().min(4).max(4).regex(/^\d+$/),
	})
	return schema.validate(user)
}
const idValidate = (user) => {
	const schema = Joi.object({
		_id: Joi.objectId()
	})
	return schema.validate(user)
} 

exports.User = User
exports.validateUser = { 
	register: userRegisterValidate,
	login: userLoginValidate,
	recover: userRecoverValidate,
	profileSet: userProfileSetValidate,
	emailSet: userEmailSetValidate,
	mobileSet: userMobileSetValidate,
	passwordSet: userPasswordValidate,
	userRole: UserRoleValidate,
	forgetPassword: UserForgetPasswordValidate,
	userList: UserListValidate,
	verificationSms: VerificationSmsValidate,
	receiveVerificationCode: ReceiveVerificationCodeValidate,
	idValidate,
	emailValidate
}