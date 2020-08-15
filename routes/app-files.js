const express = require("express")
const router = express.Router()
const { auth } = require("../middleware/auth")
const { validateUploadImage } = require("../models/file")
const isBase64 = require("is-base64")

const { deleteImage } = require("./app-files/image-delete")
const { uploadProductImage, uploadProfileImage } = require("./app-files/image-upload")


router.post('/upload-image', auth, async(req, res) => { 
	//post payload: usage, unique, image, _id
	const { error } = validateUploadImage(req.body)
	if (error) return res.json({ message: `${error.details[0].message}` })
	if (!isBase64(req.body.image, { allowMime: true })) return res.json({ message: "Invalid image."})
	
	if (req.body.usage == "profile") return await uploadProfileImage(req, res)
	if (req.body.usage == "product") return await uploadProductImage(req, res)
})

router.get('/delete-image/:server/:filename', auth, async(req, res) => {
	return await deleteImage(req, res)
})

module.exports = router
