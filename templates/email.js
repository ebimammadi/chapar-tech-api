const logoLiteral = `<span style="color: #6D9EEB; font-size:18px;" >
                      chapar<span style="color: #6AA84F">.tech</span>
                    </span>`

const emailTemplates = (message, template) => {
  if (template == 'passwordRecoverTemplate' ){
    return `${logoLiteral}<br><br><br>
      Recovery Link:<br>Please use the following link to recover your password <br>
      <a href="${process.env.APP_PATH}/recover-password/${message}" target="_blank">
        ${process.env.APP_PATH}/recover-password/${message}
      </a>`
      
  }
  if (template == 'userRegisterTemplate' ){
    return `${logoLiteral}<br><br><br>
      Dear ${message.name},<br>Welcome to ${process.env.APP_NAME}, 
      and thank you for registering at ${process.env.APP_PATH}, 
      now it is time to verify your email account with us.<br>
      Please verify your email address by click at the following link:<br>
      <a href="${process.env.APP_PATH}/verify-email/${message.emailVerify}" target="_blank">
        ${process.env.APP_PATH}/verify-email/${message.emailVerify}
      </a><br><br>You can also copy and paste the link to your web browser:<br>
      ${process.env.APP_PATH}/verify-email/${message.emailVerify}`
      
  }
  if (template == 'emailChangeWarningTemplate' ){
    return `${logoLiteral}<br><br><br>
      Dear ${message.name},<br>
      Your 'user email' has been changed at ${process.env.APP_PATH}.<br>
      If you did not send this request, please contact our support. 
      Otherwise you can ignore this email.<br>`
      
  }
  if (template == 'emailChangeVerifyTemplate' ){
    return `${logoLiteral}<br><br><br>
      Dear ${message.name},<br>
      This 'user email' has been set as your new email account at ${process.env.APP_PATH}. 
      Please verify your email address by click at the following link:<br>
      <a href="${process.env.APP_PATH}/verify-email/${message.emailVerify}" target="_blank">
        ${process.env.APP_PATH}/verify-email/${message.emailVerify}
      </a><br><br>You can also copy and paste the link to your web browser:<br>
      ${process.env.APP_PATH}/verify-email/${message.emailVerify}`
      
  }

  if (template == 'passwordChangeTemplate' ){
    return `${logoLiteral}<br><br><br>
      Dear ${message.name},<br>You have changed your password at ${process.env.APP_PATH}.<br>
      If you did not send this request, please contact our support. 
      Otherwise you can ignore this email.<br>`
      
  }

  if (template == 'userEmailVerifyTemplate'){
    return `${logoLiteral}<br><br><br>
      Dear ${message.name},<br>You are required to confirm your email address. 
      Please verify your email address by click at the following link:<br>
      <a href="${process.env.APP_PATH}/verify-email/${message.emailVerify}" target="_blank">
        ${process.env.APP_PATH}/verify-email/${message.emailVerify}
      </a><br><br>You can also copy and paste the link to your web browser:<br>
      ${process.env.APP_PATH}/verify-email/${message.emailVerify}`
      
  }

  if (template == 'newTicketAdminTemplate'){
    return `${logoLiteral}<br><br><br>
      Hej,<br>A new ticket has been created for user (${message.ownerName}, ${message.ownerEmail}). <br>
      The ticket is accessible at: <a href="${process.env.APP_PATH}/app/tickets/${message.ticketId}" target="_blank">
      ${process.env.APP_PATH}/app/tickets/${message.ticketId}</a><br> 
      ----------<br>
      subject: <b>${message.subject}</b>
      Detail: <b>${message.updates[0].text}</b> 
      <br>----------<br>`
  }
  
  if (template == 'newTicketUserTemplate'){
    return `${logoLiteral}<br><br><br>
      Hej,<br>A new ticket has been created for you (${message.ownerName}, ${message.ownerEmail}). <br>
      The ticket is accessible at: <a href="${process.env.APP_PATH}/app/tickets/${message.ticketId}" target="_blank">
      ${process.env.APP_PATH}/app/tickets/${message.ticketId}</a>. You need to login and check the status.<br> 
      ----------<br>
      subject: <b>${message.subject}</b>
      Detail: <b>${message.updates[0].text}</b> 
      <br>----------<br><br>
      We try to follow the case and answer the request as soon as possible, meanwhile we thank you for your patience.`
  }
  
  if (template == 'supplierRequestAdminTemplate') {
    return `${logoLiteral}<br><br><br>
      Hej,<br>A new user ${message.name}, email: ${message.email}, mobile no: ${message.mobile} has sent a request to be a supplier. <br>
      An 'admin' user should verify and confirm this request. Please check the following link:
       The ticket is accessible at: <a href="${process.env.APP_PATH}/app/users?search=${message.email}" target="_blank">
      ${process.env.APP_PATH}/app/users?search=${message.email}</a>. You need to login and check the status.<br>`
  }

  if (template == 'supplierRequestTemplate') {
    return `${logoLiteral}<br><br><br>
      Hej ${message.name},<br>Your supplier request has been received successfully and would be proceeded by one of the 'support team'.
      We try to follow the case and answer the request as soon as possible, meanwhile we thank you for your patience.`
  }

  if (template == 'roleGrantedTemplate') {
    return `${logoLiteral}<br><br><br>
      Hej ${message.name},<br>Your '${message.userROle} role' request has been granted and now you need to refresh your application page and continue using our platform. Enjoy ${process.env.APP_NAME}`
  }

}

exports.emailTemplates = emailTemplates;