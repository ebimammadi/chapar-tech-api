const jwt = require ("jsonwebtoken")
const winston = require("winston")
const { User } = require("../../models/user")
const { Product, generateProductSlug } = require("../../models/product") 
const { fileNameKeyGenerator } = require("../../models/file")

const { uploadToS3, removeFromS3 } = require("../../components/s3")

const uploadProductImage = async (req, res) => {
	//payload: usage, unique, image, _id
	const token = jwt.verify( req.cookies["x-auth-token"], process.env.JWT_KEY)
	const ownerId = token._id
	const ownerName = token.name
	const ownerSlug = token.slug
	let _id = req.body._id
	if (_id != "") {
		if (!await Product.findById({ _id })) return res.json({ message: 'Invalid product id.'})
	}
	else {
		const slug = await generateProductSlug(token.name) 
		const product = await new Product({ ownerId, ownerName, ownerSlug, slug, name: slug })
		_id = product._id
		product.save()
	}
	const fileNameKey = fileNameKeyGenerator(req.body.usage, ownerId, _id) 
	//read the base64Img to buffer
	const buffer = Buffer.from(req.body.image.replace(/^data:image\/\w+;base64,/, ""),'base64')
	//write the file to AWS S3 ;)
	const { Location } = await uploadToS3( fileNameKey, buffer )
	//save to database
	const product = await Product.findById(_id)
	product.images.push(Location)
	await product.save()
	return res.json({ response_type: 'success', url: Location, _id: _id })
}

const uploadProfileImage = async (req, res) => {	
	const { _id } = jwt.verify( req.cookies["x-auth-token"], process.env.JWT_KEY)
	//read record from database
	const user = await User.findOne({ _id })
	//remove previous file if required
	if (req.body.unique === 'true' && user.profilePhotoUrl ) {
		try {
			await removeFromS3(user.profilePhotoUrl)
		} catch (err) {
			return winston.log(err)
		}
	}
	const fileNameKey = fileNameKeyGenerator(req.body.usage, _id, _id) 
	//read the base64Img to buffer
	const buffer = Buffer.from(req.body.image.replace(/^data:image\/\w+;base64,/, ""),'base64')
	//write the file to AWS S3 ;)
	const { Location } = await uploadToS3( fileNameKey, buffer )
	//save to database
	user.set({ profilePhotoUrl: Location })
	await user.save()
	return res.json({ response_type: 'success', url: Location, _id: _id })
}

module.exports = {
  uploadProductImage,
  uploadProfileImage
}