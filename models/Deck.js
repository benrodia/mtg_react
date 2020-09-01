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
	slug: {
		type: String,
		required: true,
		unique: true,
	},
	published: {
		type: Boolean,
		default: false,
	},
	privacy: {
		type: String,
		default: "Public",
	},
	views: {
		type: Number,
		default: 0,
	},
	comments: {
		type: Array,
		default: [],
	},
	upvotes: {
		type: Number,
		default: 0,
	},
	name: {
		type: String,
		default: "New Deck",
	},
	desc: {
		type: String,
		default: "No Description",
	},
	format: {
		type: String,
		default: "Casual",
	},
	list: {
		type: Array,
		default: [],
	},
	feature: {
		type: String,
		default: "",
	},
})

module.exports = Deck = mongoose.model("deck", DeckSchema)
