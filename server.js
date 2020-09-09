const express = require("express")
const mongoose = require("mongoose")
const path = require("path")
const app = express()
require("dotenv").config()

app.use(express.json())

mongoose
	.connect(process.env.MONGO_URI, {
		useNewUrlParser: true,
		autoIndex: false,
	})
	.then(_ => console.log("\nMongoDB Connected...\n"))
	.catch(err => console.error(err))

app.use("/api/users", require("./routes/api/users"))
app.use("/api/decks", require("./routes/api/decks"))
app.use("/api/auth", require("./routes/api/auth"))

if (process.env.NODE_ENV === "production") {
	app.use(express.static(path.join(__dirname, "client", "build")))
	app.get("*", (req, res) => {
		res.sendFile(path.join(__dirname, "client", "build", "index.html"))
	})
}
const port = process.env.PORT || 5000

app.listen(port, _ => console.log(`\nServer is running on port: ${port}\n`))
