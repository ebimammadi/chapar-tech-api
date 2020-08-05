const mongoose = require('mongoose')

//schema
const courseSchema = new mongoose.Schema({
	name: { type: String, required: true, minlength: 5, maxlength: 255 },
	auther: { type: String },
	category: { type:String, require: true, enum: ['web','mobile','networking'] },
	tags: [ String ],
	date: { type: Date, Default: Date.now },
	isPublished: { type: Boolean },
	price: { type: Number, required: function() { return this.isPublished } }
})

//model
const Course = mongoose.model('course', courseSchema)

module.exports = Course;