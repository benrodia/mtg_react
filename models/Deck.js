const mongoose = require("mongoose")
const Schema = mongoose.Schema

const DeckSchema = new Schema({
	author: {
		type: String,
		required: true,
	},
	created: {
		type: Date,
		default: Date.now,
	},
	updated: {
		type: Date,
		default: Date.now,
	},
	url: {
		type: String,
		default: "new-deck",
	},
	name: {
		type: String,
		default: "New Deck",
	},
	desc: {
		type: String,
		default: "",
	},
	format: {
		type: String,
		default: "Casual",
	},
	list: {
		type: Array,
		default: [],
	},
	colors: {
		type: Array,
		default: [0, 0, 0, 0, 0, 1],
	},
})

module.exports = Deck = mongoose.model("deck", DeckSchema)
