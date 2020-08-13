const Joi = require('joi')
const mongoose = require('mongoose')

//schema validate mongoose
const sessionSchema = new mongoose.Schema({
	session_id: {
		type: String, 
		required: true,
		unique: true
	},
	user_id: { 
		type: String, 
		required: true
		},
	email: { 
		type: String, 
		required: true 
	},
	tokens:[
		{
			token:{
				type: String, 
				required: true, 
			},
			date: {
				type: Date,
				default: Date.now
			}
		}
	],
	isValid: {
		type: Boolean,
		default: true
	},
	date: { 
		type: Date,
		default: Date.now
	},
	updated_at:{ 
		type: Date,
	},
	status: { 
		type: String,
		default: 'Logged-in' 
	}
})

//model
const Session = mongoose.model('session', sessionSchema)

exports.Session = Session
