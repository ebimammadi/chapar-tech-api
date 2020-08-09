const { TicketsTemplates } = require("./tickets")
const { AuthTemplates } = require("./auth")
const { UsersTemplates } = require("./users")
const { ProfileTemplates } = require("./profile")

const logoLiteral = `<span style="color: #6D9EEB; font-size:18px;" >
                      chapar<span style="color: #6AA84F">.tech</span>
                    </span><br/><br/>`

const emailTemplates = (message, template) => {
  
  if (template.startsWith('Tickets')) return logoLiteral + TicketsTemplates(message, template)
  if (template.startsWith('auth')) return logoLiteral + AuthTemplates(message, template)
  if (template.startsWith('Users')) return logoLiteral + UsersTemplates(message, template)
  if (template.startsWith('Profile')) return logoLiteral + ProfileTemplates(message, template)
    
}

exports.emailTemplates = emailTemplates;