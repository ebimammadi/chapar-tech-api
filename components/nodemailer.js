const nodemailer = require('nodemailer')
const htmlToText = require('html-to-text')

const { Email } = require('../models/email')
const { emailTemplates } = require('../templates/email')

const mailer = async (to, subject, message, template) => {
  if (template) message = emailTemplates(message, template)
  
  let transporter = nodemailer.createTransport({
    host: process.env.MAIL_SERVER,
    port: 465,
    secure: true, 
    auth: {
      user: process.env.MAIL_USER, 
      pass: process.env.MAIL_PASS, 
    },
  })

  let info = await transporter.sendMail({
    from: '"noreply chapar.tech" <noreply@chapar.tech>', 
    to: to, 
    subject: subject, 
    text: htmlToText.fromString(message), 
    html: message 
  })

  console.log("Message sent: %s", info.messageId)

  const email_log = new Email({
    messageId: info.messageId,
    email: to,
    subject: subject,
    message: htmlToText.fromString(message)
  })
  try {
    await email_log.save()
  } catch(err) {
    console.log(err.message)
    return err
  }
}

module.exports = mailer
