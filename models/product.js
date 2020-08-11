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

	publishStatus: {
		type: Boolean,
		default: false
	},
	status: { 
		type: String,
		default: '' 
	},
	images: [String],
	
})

const Product = mongoose.model('Product', productSchema)

const productAddValidate = (product) => {
	const schema = Joi.object({
		
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