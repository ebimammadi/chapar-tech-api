const functions = {}
functions.ticketNewTicketAdmin = (message) => 
	`Hej,<br>A new ticket has been created for user (${message.ownerName}, ${message.ownerEmail}). <br>
	The ticket is accessible at: <a href="${process.env.APP_PATH}/app/support/id/${message.ticketId}" target="_blank">
	${process.env.APP_PATH}/app/support/id/${message.ticketId}</a><br> 
	----------------------------------------<br/>
	Subject: <b>${message.subject}</b><br/>
	----------------------------------------<br/>
	Message: <b><span style="white-space: pre-line">${message.updates[0].text}</span></b><br>
	----------------------------------------`

functions.ticketNewTicketUser = (message) => 
	`Hej,<br>A new ticket has been created for you (${message.ownerName}, ${message.ownerEmail}). <br>
	The ticket is accessible at: <a href="${process.env.APP_PATH}/app/support/id/${message.ticketId}" target="_blank">
	${process.env.APP_PATH}/app/support/id/${message.ticketId}</a>. You need to login and check the status.<br> 
	----------------------------------------<br/>
	Subject: <b>${message.subject}</b><br/>
	----------------------------------------<br/>
	Message: <b><span style="white-space: pre-line">${message.updates[0].text}</span></b><br/>
	----------------------------------------<br/>
	We try to follow the case and answer the request as soon as possible, meanwhile we thank you for your patience.`

functions.ticketUpdateTicketAdmin = (message) => {
	let body = `Hej,<br>The ticket Id '${message.ticketId}' for user (${message.ownerName}, ${message.ownerEmail}) has been updated.<br>
	The ticket is accessible at: <a href="${process.env.APP_PATH}/app/support/id/${message.ticketId}" target="_blank">
	${process.env.APP_PATH}/app/support/id/${message.ticketId}</a><br> 
	----------------------------------------<br/>
	Subject: <b>${message.subject}</b><br/>
	----------------------------------------<br/>
	Message: <b><span style="white-space: pre-line">${message.updates[message.updates.length-1].text}</span></b><br>
	----------------------------------------`
	if (message.status == 'closed') body = body + `<br>Note: this ticket is not closed, 
	but you can open <a href="${process.env.APP_PATH}/app/support/new" >a new ticket</a> if required.`
	return body
}

functions.ticketUpdateTicketUser = (message) => {
	let body = `Hej,<br>The ticket Id '${message.ticketId}' has been updated.<br>
	The ticket is accessible at: <a href="${process.env.APP_PATH}/app/support/id/${message.ticketId}" target="_blank">
	${process.env.APP_PATH}/app/support/id/${message.ticketId}</a><br> 
	----------------------------------------<br/>
	Subject: <b>${message.subject}</b><br/>
	----------------------------------------<br/>
	Message: <b><span style="white-space: pre-line">${message.updates[message.updates.length-1].text}</span></b><br>
	----------------------------------------`
	if (message.status == 'closed') body = body + `<br>Note: this ticket is not closed, 
	but you can open <a href="${process.env.APP_PATH}/app/support/new" >a new ticket</a> if required.`
	return body
}

const ticketTemplates = (message, func) => {
	return functions[func](message)
}	

exports.ticketTemplates  = ticketTemplates