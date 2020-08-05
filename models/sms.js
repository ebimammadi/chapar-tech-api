const mongoose = require('mongoose')

//schema validate mongoose
const smsSchema = new mongoose.Schema({
	result: { 
		type: Object, 
		required: true, 
	},
	number: { 
		type: String, 
		required: true, 
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
const Sms = mongoose.model('log_sms', smsSchema)

exports.Sms = Sms
