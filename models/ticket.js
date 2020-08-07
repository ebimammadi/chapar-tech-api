const mongoose = require('mongoose')
const Joi = require('joi')

//schema validate mongoose
const ticketSchema = new mongoose.Schema({
  ticketId: {
    type: String, 
    required: true,
    unique: true,
  },
  subject: { 
		type: String, 
		required: true, 
		minlength: 5, 
		maxlength: 1000 
	},
	ownerName: {
		type: String, 
		required: true, 
	},
	ownerEmail: { 
		type: String, 
		required: true, 
	},
	date: { 
		type: Date,
		default: Date.now
	},
	updated_at:{ 
		type: Date,
		default: Date.now
	},
	status: { 
		type: String,
		default: 'Open' 
	},
	updates: [{
    userEmail: {
      type: String, 
		},
		userName: {
      type: String, 
    },
    date: { 
      type: Date,
      default: Date.now
    },
    text: {
      type: String,
      minlength: 10, 
		  maxlength: 10000 
    },
    attach: [String]
  }]
})

ticketSchema.methods.generateTicketId = function(length = 6) {
	let id = ''
  const characters = 'abcdefghijklmnopqrstuvwxyz0123456789'
  const charactersLength = characters.length
  for ( let i = 0; i < length; i++ ) id += characters.charAt(Math.floor(Math.random() * charactersLength))
  return id
}

const Ticket = mongoose.model('Ticket', ticketSchema)

const ticketRegisterValidate = (ticket) => {
	const schema = Joi.object({
		subject: Joi.string().required().min(5).max(1000),
		ownerEmail: Joi.string().email().required(),
		text: Joi.string().required()
	})
	return schema.validate(ticket)
}

const ticketUpdateValidate = (ticket) => {
	const schema = Joi.object({
		ticketId: Joi.string().required().min(6).max(8),
		ownerEmail: Joi.string().email().required(),
		text: Joi.string().required(),
		status: Joi.string().required(),
	})
	return schema.validate(ticket)
}

const ticketListValidate = (ticket) => {

}

exports.Ticket = Ticket
exports.validateTicket = { 
	register: ticketRegisterValidate,
	update: ticketUpdateValidate,
	ticketList: ticketListValidate
}