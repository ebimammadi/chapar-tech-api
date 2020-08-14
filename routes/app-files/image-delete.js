const jwt = require ("jsonwebtoken")
const winston = require("winston")
const { User } = require("../../models/user")
const { Product } = require("../../models/product") 
const { validPrefixes } = require("../../models/file")
const { decodeHex } = require("../../components/lib")
const { removeFromS3 } = require("../../components/s3")

const deleteImage = async (req, res) => {
	const filename = `https://${req.params.server}/${req.params.filename}`
	const [ usage, encodedOwnerId, encodedId ] = req.params.filename.split("-")
	if(!validPrefixes.includes(usage)) return res.json({ message: `Invalid filename!`})
	//check file owner
	let { _id } = jwt.verify(req.cookies["x-auth-token"], process.env.JWT_KEY)
	if (_id != decodeHex(encodedOwnerId) ) 
		return res.json({ message: `You are not allowed to delete this file!`})
	_id = decodeHex(encodedOwnerId)	
	if (usage === "profile") {
		const user = await User.findOne({ _id })
		if (!user || (user.profilePhotoUrl != filename) ) 
			return res.json({ message: `invalid file! ${filename}` })
	}
	if (usage === "product") {
		const productId = decodeHex(encodedId)
		const product = await Product.findById( productId )
		if (!product) return res.json({ message: `invalid file! ${filename}` })
	}
	
	//delete file from server
	try {
		await removeFromS3(filename)
	} catch (err) {
		return winston.log(err, 'error')
	}
	//update database
	if (usage=== "profile") {
		await User.findByIdAndUpdate(_id, {profilePhotoUrl: ''})		
	}
	if (usage === "product") {
		const productId = decodeHex(encodedId)
		const product = await Product.findById( productId )
		product.images = product.images.filter(image => image != filename)
		await product.save()
	}
	return res.json({ response_type: 'success', url: filename, message: `${filename} removed successfully.` })
}

module.exports = {
	deleteImage
}