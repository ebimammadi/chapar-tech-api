const mongoose = require('mongoose')

//schema validate mongoose
const emailSchema = new mongoose.Schema({
	messageId: { 
		type: String, 
		required: true, 
	},
	email: { 
		type: String, 
		required: true, 
	},
	subject: {
		type: String 
	},
	date: { 
		type: Date,
		default: Date.now
	},
	message: { 
		type: String, 
	}
})

//model
const Email = mongoose.model('log_email', emailSchema)

exports.Email = Email
