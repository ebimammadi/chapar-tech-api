const functions = {}
functions.AuthRegister = (message) => 
	`Dear ${message.name},<br>Welcome to ${process.env.APP_NAME}, 
  and thank you for registering at ${process.env.APP_PATH}, 
  now it is time to verify your email account with us.<br>
  Please verify your email address by click at the following link:<br>
  <a href="${process.env.APP_PATH}/verify-email/${message.emailVerifyCode}" target="_blank">
    ${process.env.APP_PATH}/verify-email/${message.emailVerifyCode}
  </a><br><br>You can also copy and paste the link to your web browser:<br>
  ${process.env.APP_PATH}/verify-email/${message.emailVerifyCode}`    

functions.AuthPasswordRecover = (message) =>
  `Recovery Link:<br>Please use the following link to recover your password <br>
  <a href="${process.env.APP_PATH}/recover-password/${message}" target="_blank">
  ${process.env.APP_PATH}/recover-password/${message}
  </a>`

const AuthTemplates = (message, func) => {
	return functions[func](message)
}	

exports.AuthTemplates  = AuthTemplates