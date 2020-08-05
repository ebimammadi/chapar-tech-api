const express = require('express')
const router = express.Router()

const Joi = require('joi')

const mongoose = require('mongoose')

//Model
const Course = require('../models/course')
//lib functions
const { regex } = require('../components/lib'); 

//middleware
const auth = require('../middleware/auth')

//routes
router.get('/', auth, async (req,res) => {
  const query = {}, input = {}
  //! this is a query test example
  if (req.query.name) {
    query["name"] = regex(req.query.name)
    input["name"] = req.query.name
  }

  const { error } = validate(input)
  if (error) return res.json({ message: error.details[0].message })
  const courses = await Course.find(query)
  return res.send(courses)
})

//createCourse(); //would add a test course to the mongoDB
async function createCourse() {
  const course = new Course({
    name: 'web teaching',
    auther: 'Ebi',
    category: 'web',
    isPublished: true,
    price: 50
  })
  try {
    const result = await course.save()
    console.log(result)
  } catch(err) {
    console.log(err.message)
  }
}

const validate = (course) => {
  const schema = Joi.object({
    name: Joi.string()
  })
  return schema.validate(course)
}

module.exports = router
