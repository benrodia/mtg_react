const express = require("express")
const router = express.Router()
const bcrypt = require("bcryptjs")
const config = require("config")
const jwt = require("jsonwebtoken")
const auth = require("../../middleware/auth")

const User = require("../../models/User")

router.get("/", (req, res) => {
	User.find()
		.sort({joined: -1})
		.then(users => res.json(users))
})

router.post("/", (req, res) => {
	const {name, password, email} = req.body

	if (!name || !password || !email) return res.status(400).json({msg: "Please enter all fields."})

	User.findOne({email}).then(user => {
		if (user) return res.status(400).json({msg: "Email already in use."})

		const newUser = new User({name, password, email})
		bcrypt.genSalt(10, (err, salt) => {
			bcrypt.hash(newUser.password, salt, (err, hash) => {
				if (err) throw err
				newUser.password = hash
				newUser.save().then(user =>
					jwt.sign({id: user.id}, config.get("jwtSecret"), {expiresIn: 3600}, (err, token) => {
						if (err) throw err
						res.json({token, user})
					})
				)
			})
		})
	})
})

router.delete("/:id", auth, (req, res) => {
	User.findById(req.params.id)
		.then(user => user.remove().then(_ => res.json({success: true})))
		.catch(err => res.status(404).json({success: false}))
})

module.exports = router
