const express = require("express")
const router = express.Router()
const Joi = require("joi")
const sha256 = require("js-sha256")
const jwt = require ("jsonwebtoken")
const isBase64 = require("is-base64")
const winston = require("winston")
const { User } = require("../models/user")
const auth = require("../middleware/auth")
const { uploadToS3, removeFromS3 } = require("../components/s3")

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
	return usage + '-'+ encodeHex(ownerId) + '-'+ encodeHex(_id) + '-' + sha256(_id+Date.now()) +'.jpg'
}

//TODO s3 error and fault handle!!!! both on the front-end ;)
router.post('/upload-image', auth, async(req, res) => { 
	//post payload: usage, unique, image, _id
	const { error } = validateUploadImage(req.body)
	if (error) return res.json({ message: `${error.details[0].message}` })

	const { _id } = jwt.verify( req.cookies["x-auth-token"], process.env.JWT_KEY)
	//read record from database
	const user = await User.findOne({ _id })
	//remove previous file if required
	if (req.body.unique === 'true' && user.profilePhotoUrl ) {
		try{
			await removeFromS3(user.profilePhotoUrl)
		} catch (err){
			return winston.log(err)
		}
	}
	const fileNameKey = fileNameKeyGenerator(req.body.usage, _id, _id) 
	//read the base64Img to buffer
	if (!isBase64(req.body.image, { mime: true })) return res.json({ message: "Invalid image"})
	
	//!check req.body.image for an image check
	const buffer = Buffer.from(req.body.image.replace(/^data:image\/\w+;base64,/, ""),'base64')
	//write the file to AWS S3 ;)
	const { Location } = await uploadToS3( fileNameKey, buffer )
	//save to database
	user.set({ profilePhotoUrl: Location })
	await user.save()
	return res.json({ response_type: 'success', url: Location, _id: _id })

	// }catch(err){
	// 	return res.json({ response_type: 'warning', message: err.message })
	// }
})

router.get('/delete-image/:server/:filename', auth, async(req, res) => {

	const filename = `https://${req.params.server}/${req.params.filename}`
	const [ usage, encodedOwnerId, encodedId ] = req.params.filename.split("-")
	if(!validPrefixes.includes(usage)) return res.json({ message: `Invalid filename!`})
	
	//check file owner
	let { _id } = jwt.verify(req.cookies["x-auth-token"], process.env.JWT_KEY)
	if (_id != decodeHex(encodedOwnerId) ) 
		return res.json({ message: `You are not allowed to delete this file!`})

	//check file validity// filename exist on aws
	_id = decodeHex(encodedOwnerId)
	
	if (usage === "profile") {
		const user = await User.findOne({ _id })
		if (!user || (user.profilePhotoUrl != filename) ) 
			return res.json({ message: `invalid file! ${filename}` })
	}
	
	//delete file from server
	try{
		await removeFromS3(filename)
	} catch (err){
		return winston.log(err, 'error')
	}
	
	//update database
	if (usage=== "profile") {
		await User.findByIdAndUpdate(_id, {profilePhotoUrl: ''})		
	}
	
	return res.json({ response_type: 'success', url: filename, message: `${filename} removed successfully.` })
})



const toHex = (char = '') => char.charCodeAt(0).toString(16)
const encodeHex = (str = '') => str.split('').map(toHex).join('')
const decodeHex = (hex = '') => {
	const result = []
	for (let i = 0; i < hex.length; i += 2) {
		result.push(String.fromCharCode(parseInt(hex.substr(i, 2), 16)))
	}
	return result.join('')
}


module.exports = router
