const functions = {}
functions.ProfileSupplierRequest = (message) => 
	`Hej ${message.name},<br>Your supplier request has been received successfully and would be proceeded by one of the 'support team'.
  We try to follow the case and answer the request as soon as possible, meanwhile we thank you for your patience.`    

functions.ProfileSupplierRequestAdmin = (message) => 
  `Hej,<br>A new user ${message.name}, email: ${message.email}, mobile no: ${message.mobile} has sent a request to be a supplier. <br>
  An 'admin' user should verify and confirm this request. Please check the following link:
   The ticket is accessible at: <a href="${process.env.APP_PATH}/app/users?search=${message.email}" target="_blank">
  ${process.env.APP_PATH}/app/users?search=${message.email}</a>. You need to login and check the status.<br>`

functions.ProfileUserEmailVerify = (message) =>
  `Dear ${message.name},<br>You are required to confirm your email address. 
  Please verify your email address by click at the following link:<br>
  <a href="${process.env.APP_PATH}/verify-email/${message.emailVerifyCode}" target="_blank">
    ${process.env.APP_PATH}/verify-email/${message.emailVerifyCode}
  </a><br><br>You can also copy and paste the link to your web browser:<br>
  ${process.env.APP_PATH}/verify-email/${message.emailVerifyCode}`  

functions.ProfilePasswordChange = (message) => 
  `Dear ${message.name},<br>You have changed your password at ${process.env.APP_PATH}.<br>
  If you did not send this request, please contact our support. 
  Otherwise you can ignore this email.<br>`

functions.ProfileEmailChangeVerify = (message) =>
  `Dear ${message.name},<br>
  This 'email' has been set as your new email account at ${process.env.APP_PATH}. 
  Please verify your email address by click at the following link:<br>
  <a href="${process.env.APP_PATH}/verify-email/${message.emailVerifyCode}" target="_blank">
    ${process.env.APP_PATH}/verify-email/${message.emailVerifyCode}
  </a><br><br>You can also copy and paste the link to your web browser:<br>
  ${process.env.APP_PATH}/verify-email/${message.emailVerifyCode}`

functions.ProfileEmailChangeWarning = (message) =>
  `Dear ${message.name},<br>
  Your 'email' has been changed at ${process.env.APP_PATH}.<br>
  If you did not send this request, please contact our support. 
  Otherwise you can ignore this email.<br>`

const ProfileTemplates = (message, func) => {
	return functions[func](message)
}	

exports.ProfileTemplates  = ProfileTemplates