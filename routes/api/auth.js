const express = require("express")
const router = express.Router()
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const auth = require("../../middleware/auth")
require("dotenv").config()

const User = require("../../models/User")

router.post("/", (req, res) => {
	const {password, email} = req.body

	if (!password || !email)
		return res.status(400).json("Please Enter All Fields.")

	User.findOne({email}).then(user => {
		if (!user) return res.status(400).json("User Doesn't Exist.")
		bcrypt.compare(password, user.password).then(isMatch => {
			if (!isMatch) return res.status(400).json("Wrong Password.")
			jwt.sign(
				{id: user.id},
				process.env.JWT_SECRET || "jwtSecret",
				{},
				(err, token) => {
					if (err) throw err
					res.json({token, user})
				}
			)
		})
	})
})

router.get("/", auth, (req, res) => {
	User.findById(req.user.id)
		.select("-password")
		.then(user => res.json(user))
})

module.exports = router
