const mongoose = require('mongoose')
const Joi = require('joi')

//const validProductStatus = [ '', 'new', 'unavailable'  ]
//const currencies = [ 'SEK', 'EUR', 'USD' ]

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
		maxlength: 1000,
		default: ''
	},
	features: [String],
	date: { 
		type: Date,
		default: Date.now
	},
	updated_at: {
		type: Date,
		default: Date.now
	},
	publishStatus: {
		type: String,
		default: 'false'
	},
	status: { 
		type: String,
		default: '' 
	},
	images: [{
		type: String,
		maxlength: 500
	}],
	ownerId: { 
		type: mongoose.Types.ObjectId,
		required: true
	},
	ownerSlug: {
		type: String,
		default: ''
	},
	ownerName: {
		type: String,
		default: ''
	},
	price: {
		type: Number,
		max: 1000,
		min: 1,
		default: 1
	},
	priceInfo: {
		type: String,
		default: '',
		maxlength: 100, 
	},
	currency: {
		type: String,
		default: 'SEK',
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

const generateProductSlug = async (givenName, _id) => {
	if (_id === undefined) _id = null
	let slug = givenName.replace(/[^a-zA-Z \-]/g, "").split(" ").join("-").toLowerCase()
	while(true) {
		if (! await Product.findOne({ slug, _id: { $ne: _id} })) return slug
		slug = slug + (Math.floor(Math.random() * 10) + 1) 
	}
}

const productSetValidate = (product) => {
	const schema = Joi.object({
		_id: Joi.objectId().allow(''),
		name: Joi.string().required().max(200),
		description: Joi.string().required().allow('').max(500),	
		slug: Joi.string().required().max(20),	
		price: Joi.number().required().min(1).max(1000),
		images: Joi.array().items(Joi.string().max(500).allow(''))
		// features: Joi.array().items(Joi.string().required().max(200).allow('')),
		// images: Joi.array().items(Joi.string().required().max(200).allow('')),
	})
	return schema.validate(product)
}

const productListValidate = (product) => {
	const schema = Joi.object({
		page: Joi.number().integer(),
		publishStatus: Joi.string().allow('').valid( ...["true","false"] ),
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