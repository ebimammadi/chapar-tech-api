const express = require("express")
const _ = require("lodash")
const winston = require("winston")
const jwt = require("jsonwebtoken")
const { regex } = require("../components/lib")
const { Product, validateProduct, generateProductSlug } = require("../models/product")
const { auth, supplierAuth } = require("../middleware/auth")

const { removeFromS3 } = require("../components/s3")
const router = express.Router()

router.post('/product-set', auth, supplierAuth, async (req,res) => {
  // validate post payload (_id, name, slug, description, price)
  const { error } = validateProduct.productSet(req.body)
  if (error) return res.json({ message: error.details[0].message })

  const token = jwt.verify( req.cookies["x-auth-token"], process.env.JWT_KEY)
  if (req.body._id == "" || req.body._id === undefined ) {
    const slug = await generateProductSlug(req.body.slug)
    const product = new Product({ 
      ..._.pick(req.body, ['name', 'description','price','images']), 
      slug, 
      ownerId: token._id,
      ownerSlug: token.slug,
      ownerName: token.name 
    })
    await product.save()
    return res.send( {response_type: `success`, _id: product._id, message: `Product created successfully.`})
  } else {
    const product = await Product.findById(req.body._id) 
    if (!product) return res.send({ message: 'Invalid product Id' })
    if (product.ownerId.toString() !== token._id) return res.send({ message: 'You are not allowed to change this product.' })
    if (product.slug === req.body.slug) product.slug = req.body.slug
    else product.slug = await generateProductSlug(req.body.slug, req.body._id)
    product.name = req.body.name
    product.description = req.body.description
    product.price = req.body.price
    product.images = req.body.images
    product.ownerSlug = token.slug
    product.ownerName = token.name
    product.updated_at = Date.now()
    await product.save()
    return res.send( {response_type: `success`, _id: product._id, message: `Product saved successfully.`})
  }
})

router.post('/product-delete', auth, supplierAuth, async (req, res) => {
  //payload: _id
  const { error } = validateProduct.productId(req.body)
  if (error) return res.json({ message: error.details[0].message })
  const token = jwt.verify( req.cookies["x-auth-token"], process.env.JWT_KEY)
  const product = await Product.findById(req.body._id) 
  if (!product) return res.send({ message: 'Invalid product Id.' })
  if (product.ownerId.toString() !== token._id && token.userRole!= "admin") return res.send({ message: 'You are not allowed to change this product.' })
  product.images.forEach(async function(image) {
    try {
      await removeFromS3(image)
    } catch (err) {
      return winston.log(`error`, 'Error:', err)
    }
  })
  await product.remove()
  return res.send({ response_type: "success", message: `Product '${product.slug}' has been deleted successfully.` })  
})

router.post('/product-publish', auth, supplierAuth, async (req, res) => {
  // payload: _id
  
})

router.get('/product-get/:_id', auth, supplierAuth, async (req, res) => {
  // req.params: _id
  const { error } = validateProduct.productId(req.params)
	if (error) return res.json({ message: error.details[0].message })
  const token = jwt.verify( req.cookies["x-auth-token"], process.env.JWT_KEY)
  const product = await Product.findById(req.params._id) 
  if (!product) return res.send({ message: 'Invalid product Id.' })
  if (product.ownerId.toString() !== token._id) return res.send({ message: 'You are not allowed to view this product.' })
  let resultProduct = _.pick( product, ["name","slug","description","_id","images","price","ownerName","ownerSlug"])
  resultProduct = _.defaults( resultProduct, { description: '',ownerName: '', ownerSlug: '', price: '1' } )
  return res.send({ 
    response_type: "success", 
    product: resultProduct
  })  
})

//todo publish product 


//todo need to update
router.get('/product-list', auth, supplierAuth, async (req, res) => {
  // req.query: search, page, ownerId, publishStatus
  const { error } = validateProduct.productList(req.query)
	if (error) return res.json({ message: error.details[0].message })
  const perPage = parseInt(process.env.PER_PAGE)
  const page = parseInt(req.query.page) || 1
  const skip = (page-1) * perPage
  
  const token = jwt.verify( req.cookies["x-auth-token"], process.env.JWT_KEY)
  const ownerId = (token.userRole === "admin") ? regex(req.query.ownerId || '') :  token._id
  const publishStatus = regex(req.query.publishStatus || '')
  //console.log(publishStatus)
  const search = regex(req.query.search.trim() || '')
  const findOptions = { name: search}
  // const findOptions = {
  //   $and: [ { $or: [ { name: search }, {slug: search }, {description: search }] }, { ownerId: ownerId} ]
  // }
  // const findOptions = {
  //   $and: [ { publishStatus: publishStatus }, { $or: [ { name: search }, {slug: search }, {description: search }] }, { ownerId: ownerId} ]
  // }
  const result = await Product.aggregate([
    { $sort: {date: -1} },
    { $match: findOptions },
    { $facet: {
        "stage1" : [ { "$group": { _id: null, count: { $sum: 1 } } } ],
        "stage2" : [ { "$skip": skip }, {"$limit": perPage } ]
      }
    },
    { $unwind: "$stage1" },
    { $project: {
        count: "$stage1.count",
        data: "$stage2"
      }
    }
  ])
  if (result.length == 0) return res.json( { count: 0, products: [], perPage } )
  const products = result[0].data.map ( product => 
    _.defaults( 
      _.omit( product, ["__v"]), 
      { description: '',ownerName: '', ownerSlug: '', price: '1', publishStatus: 'false' } 
    )
  )
  return res.json( { perPage, count: result[0].count, products })
})

module.exports = router
