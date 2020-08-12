const mongoose = require('mongoose')
const Joi = require('joi')

//const validProductStatus = [ '', 'new', 'unavailable'  ]

//schema validate mongoose
const productSchema = new mongoose.Schema({  
  name: { 
		type: String, 
		required: true
	},
	slug: {
		type: String, 
		required: true,
		unique: true,
	},
	description: { 
		type: String, 
	},
	features: [String],
	date: { 
		type: Date,
		default: Date.now
	},
	publishStatus: {
		type: Boolean,
		default: false
	},
	status: { 
		type: String,
		default: '' 
	},
	images: [String],
	ownerId: { 
		type: mongoose.Types.ObjectId,
		required: true
	}
})

const Product = mongoose.model('Product', productSchema)

const productAddValidate = (product) => {
	const schema = Joi.object({
		name: Joi.string().required().max(200),
		slug: Joi.string().required().max(200),	
		description: Joi.string().required().max(1000),	
		features: Joi.array().items(Joi.string().required().max(200).allow('')),
		images: Joi.array().items(Joi.string().required().max(200).allow('')),
		ownerId: Joi.objectId().allow('') 
	})
	return schema.validate(product)
}

const productListValidate = (product) => {
	const schema = Joi.object({
		page: Joi.number().integer(),
		status: Joi.string().allow('').valid( ...validProductStatus ),
		search: Joi.string().allow('').max(64),
	})
	return schema.validate(product)
}

exports.Product = Product
exports.validateProduct = { 
	productAdd: productAddValidate,
	productList: productListValidate
}