const jwt = require("jsonwebtoken")
require("dotenv").config()

function auth(req, res, next) {
	const token = req.header("x-auth-token")
	if (!token) return res.status(401).json("No token, authorization denied.")

	try {
		req.user = jwt.verify(token, process.env.JWT_SECRET || "jwtSecret")
		next()
	} catch (e) {
		return res.status(400).json("Token is not valid.")
	}
}

module.exports = auth
