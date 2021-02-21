const express = require("express")
const router = express.Router()
const auth = require("../../middleware/auth")

const {Deck} = require("../../models/Deck").schema

router.get("/", (req, res) => {
	console.log("GET DECKS", Deck)
	Deck.find()
		.sort({updated: -1})
		.then(decks => res.json(decks))
})

router.post("/", (req, res) => {
	const newDeck = new Deck(req.body)
	newDeck.save().then(deck => res.json(deck))
})

router.patch("/:id", (req, res) => {
	Deck.findById(req.params.id)
		.then(deck => deck.update(req.body).then(updated => res.json(updated)))
		.catch(err => res.status(404).json({success: false}))
})

router.delete("/:id", auth, (req, res) => {
	Deck.findById(req.params.id)
		.then(deck => deck.remove().then(_ => res.json({success: true})))
		.catch(err => res.status(404).json({success: false}))
})

module.exports = router
