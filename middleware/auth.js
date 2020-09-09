const config = require("config")
const jwt = require("jsonwebtoken")

function auth(req, res, next) {
	const token = req.header("x-auth-token")
	if (!token) return res.status(401).json("No token, authorization denied.")

	try {
		req.user = jwt.verify(token, config.get("jwtSecret"))
		next()
	} catch (e) {
		return res.status(400).json("Token is not valid.")
	}
}

module.exports = auth
