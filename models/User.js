const mongoose = require("mongoose")
const Schema = mongoose.Schema

module.exports = User = mongoose.model(
	"user",
	new Schema({
		object: {
			type: String,
			default: "user",
		},
		name: {
			type: String,
			required: true,
		},
		password: {
			type: String,
			required: true,
		},
		email: {
			type: String,
			required: true,
			unique: true,
		},
		joined: {
			type: Date,
			default: Date.now,
		},
		last_login: {
			type: Date,
			default: Date.now,
		},
		slug: {
			type: String,
			required: true,
			unique: true,
		},
		image: {
			type: String,
			default: "",
		},
		bio: {
			type: String,
			default: "",
		},
		liked: {
			type: Array,
			default: [],
		},
		followed: {
			type: Array,
			default: [],
		},
		blocked: {
			type: Array,
			default: [],
		},
		folders: {
			type: Array,
			default: [],
		},
		goodies: {
			type: Object,
			default: {
				points: 0,
				sleeves: [],
				playmats: [],
				acheivements: [],
			},
		},
		settings: {
			type: Object,
			default: {
				scale: {
					type: Number,
					default: 100,
				},
				darken: {type: Number, default: 70},
				game_log: {type: Boolean, default: true},
				playmat: {type: String, default: ""},
				random_playmat: {type: Boolean, default: true},
				use_stack: {
					type: Array,
					default: [
						"Action",
						"Spell",
						"Activated Ability",
						"Triggered Ability",
					],
				},
				mana_tolerance: {type: Number, default: 3},
			},
		},
	})
)
