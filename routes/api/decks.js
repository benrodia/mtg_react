const express = require("express")
const router = express.Router()
const auth = require("../../middleware/auth")

const Deck = require("../../models/Deck")

router.get("/", (req, res) => {
	Deck.find()
		.sort({updated: -1})
		.then(decks => res.json(decks))
})

router.post("/", (req, res) => {
	const newDeck = new Deck({author: req.body.author})
	newDeck.save().then(deck => res.json(deck))
})

router.put("/:id", (req, res) => {
	Deck.findById(req.params.id).then(deck => req.body)
})

router.patch("/:id", (req, res) => {
	Deck.findById(req.params.id).then(deck => req.body)
})

router.delete("/:id", auth, (req, res) => {
	Deck.findById(req.params.id)
		.then(deck => deck.remove().then(_ => res.json({success: true})))
		.catch(err => res.status(404).json({success: false}))
})

module.exports = router
