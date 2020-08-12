const express = require("express")
const router = express.Router()
const _ =require("lodash")
const jwt = require("jsonwebtoken")
const { regex } = require("../components/lib")
const { Product, validateProducts } = require("../models/product")
// const { User } = require("../models/user")

const auth = require("../middleware/auth")
const supplierAuth = require("../middleware/supplierAuth")

const checkUniqueSlugProduct = async (slug) => {
  slug.trim().toLowerCase().split(" ").join("-")	
  while(true){
    if (!await Product.findOne({ slug })) break
    slug = slug + (Math.floor(Math.random() * 10) + 1) 
  }
}

//add product-image
//delete product image

router.post('/product-add', auth, supplierAuth, async (req,res) => { // 
  // validate post payload (name, slug, description, features, images, _id)
  const { error } = validateProducts.productAdd(req.body)
  if (error) return res.json({ message: error.details[0].message })

  const token = jwt.verify( req.cookies["x-auth-token"], process.env.JWT_KEY)
  if (token.userRole !== 'supplier' && token.userRole !== 'admin' ) 
    return res.send({ message: `Product add not allowed!` })

  const slug = checkUniqueSlugProduct(req.body.slug)
  const product = new Product({ 
    ..._.pick(req.body, ['name', 'description', 'features', 'images']), 
    slug, 
    ownerId: token._id 
  })
  await product.save()
  return res.send( {response_type: `success`, message: `Product created successfully. 
    You need to review the product and then publish it on the website.`})
})

router.get('/product-list', auth, supplierAuth, async (req, res) => {
  // req.query: search, page, email, status
  const { error } = validateTicket.ticketList(req.query)
	if (error) return res.json({ message: error.details[0].message })
  const perPage = parseInt(process.env.PER_PAGE)
  const page = parseInt(req.query.page) || 1
  const skip = (page-1) * perPage
  
  const token = jwt.verify( req.cookies["x-auth-token"], process.env.JWT_KEY)
  const ownerEmail = (token.userRole === "admin") ? regex(req.query.email || '') :  token.email
  const status = regex(req.query.status || '')
  const search = regex(req.query.search.trim() || '')
  const findOptions = {
    $and: [ { status: status }, { $or: [ { subject: search }, {ticketId: search }] }, { ownerEmail: ownerEmail} ]
  }
  const result = await Ticket.aggregate([
    { $sort: {updated_at: -1} },
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
  if (result.length == 0) return res.json( { count: 0, tickets: [], perPage } )
  const tickets = result[0].data.map ( ticket => _.omit( ticket, [ "updates", "__v", "_id" ]) )
  return res.json( { perPage, count: result[0].count, tickets })
})



module.exports = router
