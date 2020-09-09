const express = require("express")
const router = express.Router()
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const auth = require("../../middleware/auth")
require("dotenv").config()

const User = require("../../models/User")

// GET ALL
router.get("/", (req, res) => {
	User.find()
		.sort({joined: -1})
		.then(users => res.json(users))
})

// LOGIN
// router.post("/", (req, res) => {
// 	const {password, email} = req.body

// 	if (!password || !email) return res.status(400).json("Please Enter All Fields.")

// 	User.findOne({email}).then(user => {
// 		if (!user) return res.status(400).json("User Doesn't Exist.")
// 		bcrypt.compare(password, user.password).then(isMatch => {
// 			if (!isMatch) return res.status(400).json("Wrong Password.")
// 			jwt.sign({id: user.id}, config.get("jwtSecret"), {expiresIn: 7200}, (err, token) => {
// 				if (err) throw err
// 				res.json({token, user})
// 			})
// 		})
// 	})
// })

// REGISTER
router.post("/", (req, res) => {
	const {name, password, email, slug} = req.body

	if (!name || !password || !email) return res.status(400).json({msg: "Please enter all fields."})

	User.findOne({email}).then(user => {
		if (user) return res.status(400).json({msg: "Email already in use."})

		const newUser = new User({name, password, email, slug})
		bcrypt.genSalt(10, (err, salt) => {
			bcrypt.hash(newUser.password, salt, (err, hash) => {
				if (err) throw err
				newUser.password = hash
				newUser.save().then(user =>
					jwt.sign({id: user.id}, process.env.JWT_SECRET || "jwtSecret", {expiresIn: 3600}, (err, token) => {
						if (err) throw err
						res.json({token, user})
					})
				)
			})
		})
	})
})

// UPDATE
router.patch("/:id", (req, res) => {
	User.findById(req.params.id)
		.then(user => user.update(req.body).then(updated => res.json(updated)))
		.catch(err => res.status(404).json({success: false}))
})

// DELETE
router.delete("/:id", auth, (req, res) => {
	User.findById(req.params.id)
		.then(user => user.remove().then(_ => res.json({success: true})))
		.catch(err => res.status(404).json({success: false}))
})

module.exports = router
