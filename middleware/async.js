module.exports = function(handler) { //factory function ;)
	return async (req, res, next) => {
		try {
			await handler(req, res)
		}
		catch(err) {
			next(err)
		}
	}
}
