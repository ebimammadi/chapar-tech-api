const express = require("express")
const router = express.Router()
const Joi = require("joi")
const sha256 = require("js-sha256")
const jwt = require ("jsonwebtoken")

const AWS = require("aws-sdk")
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ID,
  secretAccessKey: process.env.AWS_SECRET
})

const { User } = require("../models/user")
const auth = require("../middleware/auth")
//TODO s3 error and fault handle!!!! both on the front-end ;)
router.post('/upload-image', auth, async(req, res) => { //post payload: usage, unique, image
	const { error } = validateUploadImage(req.body)
	if (error) return res.json({ message: `${error.details[0].message}` })
	try{
		//generate-filename
		const { _id } = jwt.verify( req.cookies["x-auth-token"], process.env.JWT_KEY)
		//read record from database
		const user = await User.findOne({ _id })
		//const profilePhotoUrl = user.profilePhotoUrl
		//remove previous file
		if (req.body.unique === 'true' && user.profilePhotoUrl ) await removeFromS3(user.profilePhotoUrl)
    //upload to storage
    //!check req.body.image for an image check
    //read the base64Img to buffer
    const buffer = Buffer.from(req.body.image.replace(/^data:image\/\w+;base64,/, ""),'base64')
    const fileNameKey = req.body.usage + '-'+ encodeHex(_id) + '-' + sha256(_id+Date.now()) +'.jpg';//!png and other extensions
    //write the file to AWS S3 ;)
    const { Location } = await uploadToS3( fileNameKey, buffer )
		//save to database
		user.set({ profilePhotoUrl: Location })
		await user.save()
		//return the result
		res.status(200).json({
			success: 'true',
			url: Location
		})
	}catch(err){
		return res.json({ response_type: 'warning', message: err.message })
	}
})
//!
router.get('/delete-image/:server/:filename', auth, async(req, res) => {
	try{
		const filename = `https://${req.params.server}/${req.params.filename}`
		const [ usage, encodedId ] = req.params.filename.split("-")
		//TODO It can be developed for other usages types 
		if(usage !== "profile") return res.json({ message: `this usage '${usage}' is not allowed yet!`})
		let { _id } = jwt.verify(req.cookies["x-auth-token"], process.env.JWT_KEY)
		
		if (_id != decodeHex(encodedId) ) return res.json({ message: `You are not allowed to delete this file!`})
		_id = decodeHex(encodedId)
		const user = await User.findOne({ _id })
		if (!user || (user.profilePhotoUrl != filename) ) return res.json({ message: `invalid file! ${filename}` })

		//delete file from server
		const result = await removeFromS3(filename)

		//update filename in db
		user.set({ profilePhotoUrl: '' })
		await user.save();	
		//return
		return res.json({ response_type: 'success', url: filename, message: `${filename} removed successfully.` })
	}catch(err){
		
		return res.json({ message: err.message })
	}

})

const removeFromS3 = (file) => {
  const [ key ] = file.split('/').reverse()
  const s3Params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: key
  };
	return new Promise ( (resolve, reject) => {
    s3.deleteObject(s3Params, function(err, data) {

      if (err) {
				console.log(`error`,err.stack)
				reject (err.stack)
			}
			else resolve(data)
    })
	})
}

const uploadToS3 = (key, body) => {
  const s3Params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: key,
    Body: body,
    ACL: "public-read"
  }
  return new Promise( (resolve, reject) => {
    s3.upload(s3Params, (error,data) => {
      if (error) reject(error)
      else resolve(data)
    })
  })
}

const toHex = (char = '') => char.charCodeAt(0).toString(16)
const encodeHex = (str = '') => str.split('').map(toHex).join('')
const decodeHex = (hex = '') => {
	const result = []
	for (let i = 0; i < hex.length; i += 2) {
		result.push(String.fromCharCode(parseInt(hex.substr(i, 2), 16)))
	}
	return result.join('')
}

const validPrefixes = ['profile','product','point','receipt']

const validateUploadImage = (image) => {	
	const imageSchema = Joi.object({
		usage: Joi.string().required().valid(...validPrefixes),
		unique: Joi.string().valid('','true'),
		image: Joi.string().required()
	})
	return imageSchema.validate(image)
}

module.exports = router
