const mongoose = require('mongoose')
const Joi = require('joi')

//const validProductStatus = [ '', 'new', 'unavailable'  ]

//schema validate mongoose
const productSchema = new mongoose.Schema({  
  name: { 
		type: String,
		maxlength: 200, 
		default: '',
	},
	slug: {
		type: String,
		maxlength: 20, 
		unique: true,
		sparse: true
	},
	description: { 
		type: String, 
		maxlength: 1000
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
	},
	ownerSlug: {
		type: String
	},
	ownerName: {
		type: String
	}
})

// productSchema.methods.generateSlug = async function(givenName) {
// 	let slug = givenName.slice(0,3)
// 	while(true) {
// 		if (! await this.findOne({ slug })) return slug
// 		slug = slug + (Math.floor(Math.random() * 10) + 1) 
// 	}
// }

const Product = mongoose.model('Product', productSchema)

const generateProductSlug = async (givenName) => {
	let slug = givenName.toLowerCase().split(" ").map(item => item.slice(0,2)).join("-")
	while(true) {
		if (! await Product.findOne({ slug })) return slug
		slug = slug + (Math.floor(Math.random() * 10) + 1) 
	}
}

const productSetValidate = (product) => {
	const schema = Joi.object({
		name: Joi.string().required().max(200),
		slug: Joi.string().required().max(20),	
		description: Joi.string().required().allow('').max(500),	
		features: Joi.array().items(Joi.string().required().max(200).allow('')),
		// images: Joi.array().items(Joi.string().required().max(200).allow('')),
		_id: Joi.objectId().allow('')
	})
	return schema.validate(product)
}

const productListValidate = (product) => {
	const schema = Joi.object({
		page: Joi.number().integer(),
		publishStatus: Joi.string().allow('').valid( ["true","false"] ),
		search: Joi.string().allow('').max(64),
		ownerId: Joi.objectId().allow('')
	})
	return schema.validate(product)
}

const productIdValidate = (product) => {
	const schema = Joi.object({
		_id: Joi.objectId()
	})
	return schema.validate(product)
}

exports.Product = Product
exports.generateProductSlug = generateProductSlug
exports.validateProduct = { 
	productSet: productSetValidate,
	productId: productIdValidate,
	productList: productListValidate
}