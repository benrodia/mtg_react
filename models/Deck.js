const mongoose = require("mongoose")
const Schema = mongoose.Schema

module.exports = Deck = mongoose.model(
	"deck",
	new Schema(
		{
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
			published: Boolean,
			views: Number,
			privacy: {
				type: String,
				default: "Public",
			},
			helpWanted: {
				type: Number,
				default: 2,
			},
			colors: {
				type: Array,
				default: [0, 0, 0, 0, 0, 1],
			},
			suggestions: Array,
			likes: Number,
			tags: Array,
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
		},
		{optimisticConcurrency: true}
	)
)
