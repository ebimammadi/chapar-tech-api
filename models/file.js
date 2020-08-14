const Joi = require("joi")
const sha256 = require("js-sha256")
const { encodeHex } = require("../components/lib")

const validPrefixes = ['profile','product','point','receipt']

const validateUploadImage = (image) => {	
	const imageSchema = Joi.object({
		usage: Joi.string().required().valid(...validPrefixes),
		unique: Joi.string().valid('','true'),
		image: Joi.string().required(),
		_id: Joi.objectId().allow('')
	})
	return imageSchema.validate(image)
}

const fileNameKeyGenerator = (usage, ownerId, _id) => {
	ownerId = ownerId.toString()
	_id = _id.toString()
	return usage + '-'+ encodeHex(ownerId) + '-'+ encodeHex(_id) + '-' + sha256(_id+Date.now()) +'.jpg'
}

module.exports = {
  validPrefixes,
  validateUploadImage,
  fileNameKeyGenerator
}
