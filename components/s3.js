const AWS = require("aws-sdk")

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ID,
  secretAccessKey: process.env.AWS_SECRET
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
				reject(err.stack)
				// console.log(`error`,err.stack)
				// reject (err.stack)
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

module.exports = { removeFromS3, uploadToS3 }
