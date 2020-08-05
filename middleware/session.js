
const { Session } = require("../models/session")

const createSession = async (sessionObj) => {
	if (!sessionObj.status) sessionObj.status = 'Logged-in'
	const tokens = []
	tokens.push({ token:sessionObj.token }) 
	const session = new Session({
		user_id: sessionObj._id,
		session_id: sessionObj.session_id,
		email: sessionObj.email,
		tokens: tokens,
		status: sessionObj.status
	})
	await session.save()
}

const refreshSession = async (session_id, token, status) => {
	let session = await Session.findOne({ session_id, isValid: true })
	if (!session) return null
	if (session.tokens.length == 10 ) session.tokens.pop()
	session.tokens.push({ token })
	if (status) {
		session.status = status 
		if (status == 'Signed-out') session.isValid = false
	}
	return await session.save()
}

const invalidateSessions = async (user_id, status, exception) => {
	return await Session.updateMany( 
		{ user_id: user_id, session_id: { "$ne": exception } },
		{ isValid: false, status: status }
	)
}

module.exports = { createSession, refreshSession, invalidateSessions }
