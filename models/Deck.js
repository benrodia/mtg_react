const mongoose = require("mongoose")
const Schema = mongoose.Schema

module.exports = Deck = mongoose.model(
	"deck",
	new Schema({
		object: "deck",
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
		published: {type: Boolean, default: false},
		views: {type: Number, default: 0},
		privacy: {type: String, default: "Public"},
		allow_suggestions: {type: Number, default: 2},
		colors: {type: Array, default: [0, 0, 0, 0, 0, 1]},
		suggestions: {type: Array, default: []},
		likes: {type: Number, default: 0},
		tags: {type: Array, default: []},
		name: {type: String, required: true},
		desc: {type: String, default: "No Description"},
		format: {type: String, default: "Casual"},
		list: {type: Array, default: []},
		feature: {type: String, default: ""},
		sleeve: {type: String, default: ""},
		custom: {type: Array, default: []},
	})
)
