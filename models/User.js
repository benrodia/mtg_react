const mongoose = require("mongoose")
const Schema = mongoose.Schema

const UserSchema = new Schema({
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
	slug: {
		type: String,
		required: true,
		unique: true,
	},
	liked: Array,
	followed: Array,
	blocked: Array,
	points: Number,
	acheivements: Array,
})

module.exports = User = mongoose.model("user", UserSchema)
