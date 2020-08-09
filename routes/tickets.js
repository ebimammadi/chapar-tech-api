const express = require("express")
const router = express.Router()
const _ =require("lodash")
const jwt = require("jsonwebtoken")
const { regex } = require("../components/lib")
const { Ticket, validateTicket } = require("../models/ticket")
const { User } = require("../models/user")
const mailer = require("../components/nodemailer")
const auth = require("../middleware/auth")
router.post('/ticket-create', auth, async (req,res) => { // 
  //! TODO check text for invalid char 
  // validate post payload (subject, ownerEmail, text
  const { error } = validateTicket.register(req.body)
  if (error) return res.json({ message: error.details[0].message })
  // check the same user or admin role to create a ticket
  const token = jwt.verify( req.cookies["x-auth-token"], process.env.JWT_KEY)
	if (token.userRole!== "admin" && token.email !== req.body.ownerEmail ) return res.send({ message: `Ticket creation not allowed!` })
  const user = await User.findOne({ email: req.body.ownerEmail })
  if (!user) return res.send({ message: `Invalid user email ${req.body.ownerEmail}` })
  const ticket = new Ticket(_.pick(req.body, ['subject', 'ownerEmail']))
  let ticketId = '' 
  while(true){
    ticketId = ticket.generateTicketId()
    if (! await Ticket.findOne( { ticketId })) break; 
  }
  ticket.ownerName = user.name
  ticket.ticketId = ticketId
  ticket.status = "Open"
  ticket.updates.push({ userEmail: token.email, userName: token.name, text: req.body.text.trim() })
  await ticket.save()
  //email
  let admins = await User.find({ userRole: `admin` }) // todo: admins read email from 
  for (let i=0; i< admins.length; i++)
    await mailer(admins[i].email, `New ticket [${ticketId}] created at ${process.env.APP_NAME}`, ticket, 'TicketsNewTicketAdmin')
  await mailer(ticket.ownerEmail, `New ticket [${ticketId}] created at ${process.env.APP_NAME}`, ticket, 'TicketsNewTicketUser')
  return res.send( {response_type: `success`, message: `Ticket '${ticketId}' created successfully.`, ticketId: ticketId}); 
})

router.post('/ticket-update', auth, async (req,res) => { 
  // payload: ticketId, ownerEmail, text, status
  const { error } = validateTicket.update(req.body)
  if (error) return res.json({ message: error.details[0].message })
  //check access to update the ticket
  const token = jwt.verify( req.cookies["x-auth-token"], process.env.JWT_KEY)
	if (token.userRole!== "admin" && token.email !== req.body.user ) return res.send({ message: `Ticket update not allowed!` })  
  const user = await User.findOne({ email: req.body.ownerEmail })
  if (!user) return res.send({ message: `Invalid user email ${req.body.ownerEmail}` })
  let ticket = await Ticket.findOne({ ticketId: req.body.ticketId } )
  if (!ticket) return res.send({ message: `Invalid ticket ID ${req.body.ticketId}` })
  
  const ticketId = req.body.ticketId
  ticket.ownerEmail = req.body.ownerEmail
  ticket.ownerName = user.name
  ticket.status = req.body.status
  ticket.updated_at = Date.now()
  const update = { 
    userEmail: token.email, 
    userName: token.name, 
    text: req.body.text.trim(),
    date: ticket.updated_at
   }
  ticket.updates.push(update)
  await ticket.save()
  const admins = await User.find({ userRole: `admin` })   //todo admins read email from 
  for (let i=0; i< admins.length; i++) //todo: for close tickets
    await mailer(admins[i].email, `Ticket [${ticketId}] updated at ${process.env.APP_NAME}`, ticket, 'TicketsUpdateTicketAdmin')
  await mailer(ticket.ownerEmail, `Ticket [${ticketId}] updated at ${process.env.APP_NAME}`, ticket, 'TicketsUpdateTicketUser')
  
  return res.send( { response_type: `success`, message: 'Ticket Updated Successfully.', ticketId, update }); 
})

router.get('/ticket-list', auth, async (req, res) => {
  // req.query: search, page, email, status
  const { error } = validateTicket.ticketList(req.query)
	if (error) return res.json({ message: error.details[0].message })
  const perPage = parseInt(process.env.PER_PAGE)
  const page = parseInt(req.query.page) || 1
  const skip = (page-1) * perPage
  
  const token = jwt.verify( req.cookies["x-auth-token"], process.env.JWT_KEY)
  const ownerEmail = (token.userRole === "admin") ? regex(req.query.email || '') :  token.email
  const status = regex(req.query.status || '')
  const search = regex(req.query.search || '')
  const findOptions = {
    $and: [ { status: status }, { subject: search }, { ownerEmail: ownerEmail} ]
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

router.get('/ticket-get/:ticketId', auth, async (req, res) => {
  // req.query: ticketId, page, email, status
  const { error } = validateTicket.ticketId(req.params)
  if (error) return res.json({ message: error.details[0].message })
  const token = jwt.verify( req.cookies["x-auth-token"], process.env.JWT_KEY)
  const filterOptions = { ticketId: req.params.ticketId }
  if (token.userRole !== "admin") filterOptions.ownerEmail = token.email
  const ticket = await Ticket.findOne(filterOptions).select("-__v -_id")
  ticket.updates = ticket.updates.reverse()
  return res.json(ticket)
})

module.exports = router
