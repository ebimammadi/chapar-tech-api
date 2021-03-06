const responseHeaderConfig = function (req, res, next) {
	res.header("Access-Control-Expose-Headers", "x-auth-token")
	res.header("Access-Control-Allow-Origin", `${process.env.APP_PATH}`)
	next()
}

const cookieOptions = { 
	maxAge: parseInt(parseFloat(process.env.JWT_EXP_HOUR)*3600*1000), 
	sameSite: 'Strict',
	secure: true,
	httpOnly: true
}

if (process.env.APP_PATH === "http://localhost") cookieOptions.secure = false

module.exports = { responseHeaderConfig, cookieOptions }
