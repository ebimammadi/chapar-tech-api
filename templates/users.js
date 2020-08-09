const functions = {}
functions.UsersRoleGranted = (message) => 
	`Hej ${message.name},<br>Your '${message.userROle} role' request has been granted and now you need to sign out 
  and re login your application page and continue using our platform. Enjoy ${process.env.APP_NAME}`    


const UsersTemplates = (message, func) => {
	return functions[func](message)
}	

exports.UsersTemplates  = UsersTemplates