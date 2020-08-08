const ticketNewTicketAdmin = (message) => 
	`Hej,<br>A new ticket has been created for user (${message.ownerName}, ${message.ownerEmail}). <br>
	The ticket is accessible at: <a href="${process.env.APP_PATH}/app/support/id/${message.ticketId}" target="_blank">
	${process.env.APP_PATH}/app/support/id/${message.ticketId}</a><br> 
	----------<br/><br/>
	subject: <b>${message.subject}</b><br/>
	Detail: <b><span style="white-space: pre-line">
	${message.updates[0].text}
	</span></b>
	<br>----------<br>`

const ticketNewTicketUser = (message) => 
	`Hej,<br>A new ticket has been created for you (${message.ownerName}, ${message.ownerEmail}). <br>
	The ticket is accessible at: <a href="${process.env.APP_PATH}/app/support/id/${message.ticketId}" target="_blank">
	${process.env.APP_PATH}/app/support/id/${message.ticketId}</a>. You need to login and check the status.<br> 
	----------<br/><br/>
	subject: <b>${message.subject}</b><br/>
	Detail: <b>
	<span style="white-space: pre-line">
	${message.updates[0].text}
	</span>
	</b> 
	<br/>----------<br/><br/>
	We try to follow the case and answer the request as soon as possible, meanwhile we thank you for your patience.`

exports.ticketTemplates = {
	ticketNewTicketAdmin,
	ticketNewTicketUser

}