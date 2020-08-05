const express = require("express")
const router = express.Router()
const _ =require("lodash")
const jwt = require("jsonwebtoken")

const mailer = require("../components/nodemailer")
const sendSms = require("../components/sms")

const { Ticket, validateTicket } = require("../models/ticket")
const { User } = require("../models/user")
const auth = require("../middleware/auth")
//const adminAuth = require("../middleware/adminAuth")

router.post('/ticket-create', auth, async (req,res) => { // 
  //! TODO check text for invalid char
  // validate post payload (subject, ownerEmail, text
  const { error } = validateTicket.register(req.body)
  if (error) return res.json({ message: error.details[0].message })
  // check the same user or admin role to create a ticket
  const token = jwt.verify( req.cookies["x-auth-token"], process.env.JWT_KEY)
	if (token.userRole!== "admin" && token.email !== req.body.ownerEmail ) return res.send({ message: `Ticket creation not allowed!` })
  //main 
 
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
  ticket.updates.push({ userEmail: token.email, userName: token.name, text: req.body.text })
  
  await ticket.save()
  //admins read email from 
  let admins = await User.find({ userRole: `admin` })
  for (let i=0; i< admins.length; i++){
    await mailer(admins[i].email,`New ticket [${ticketId}] created at ${process.env.APP_NAME}`,ticket,'newTicketAdminTemplate')
  }
  await mailer(ticket.ownerEmail,`New ticket [${ticketId}] created at ${process.env.APP_NAME}`,ticket,'newTicketUserTemplate')
  
  return res.send( {message_response: `success`, ticketId: ticketId}); 
})

router.post('/ticket-update', auth, async (req,res) => { // ticketId, ownerEmail, text, status
  //TODO check text for invalid char
  //validate req.body
  const { error } = validateTicket.update(req.body)
  if (error) return res.json({ message: error.details[0].message })
  //check access to update the ticket
  const token = jwt.verify( req.cookies["x-auth-token"], process.env.JWT_KEY)
	if (token.userRole!== "admin" && token.email !== req.body.user ) return res.send({ message: `Ticket update not allowed!` })
  
  const user = await User.findOne({ email: req.body.ownerEmail })
  if (!user) return res.send({ message: `Invalid user email ${req.body.ownerEmail}` })
  
  let ticket = await Ticket.findOne({ ticketId: req.body.ticketId } )
  if (!user) return res.send({ message: `Invalid ticket ID ${req.body.ticketId}` })
  
  ticket = new Ticket(_.pick(req.body, ['subject', 'ownerEmail']))
  let ticketId = req.body.ticketId
  
  ticket.ownerName = user.name
  ticket.status = req.body.status
  ticket.updated_at = Date.now()
  ticket.updates.push({ userEmail: token.email, userName: token.name, text: req.body.text })
  
  await ticket.save()
  //todo admins read email from 
  let admins = await User.find({ userRole: `admin` })
  for (let i=0; i< admins.length; i++){//! todo important ticket template updates
    await mailer(admins[i].email,`New ticket [${ticketId}] created at ${process.env.APP_NAME}`,ticket,'newTicketAdminTemplate')
  }
  !await mailer(ticket.ownerEmail,`New ticket [${ticketId}] created at ${process.env.APP_NAME}`,ticket,'newTicketUserTemplate')
  
  return res.send( {message_response: `success`, ticketId: ticketId}); 
})
router.get('/ticket-list', auth, async (req, res) => {
  const token = jwt.verify( req.cookies["x-auth-token"], process.env.JWT_KEY)
  if (token.userRole === "admin") {

  }else {

  }
  //!handle the req.params optional
  //! https://stackoverflow.com/a/41748728/1007945
  
  //! filter per user or admin !!!!!
  //! supper important

  let tickets = await Ticket.find().sort({ updated_at: -1 })
  tickets = tickets.map( item => _.pick( item, [ "subject", "ownerEmail", "ownerName", "status", "date", "updated_at", "ticketId" ]) )
  return res.json( tickets )
})
module.exports = router
