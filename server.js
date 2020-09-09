const express = require("express")
const mongoose = require("mongoose")
const config = require("config")
const path = require("path")
const app = express()

if (process.env.NODE_ENV === "production") {
	app.use(express.static("client/build"))

	app.get("*", (req, res) => res.sendFile(path.resolve(__dirname, "client", "build", "index.html")))
}
const port = process.env.PORT || 5000

app.use(express.json())

mongoose
	.connect(config.get("mongoUri"), {
		useNewUrlParser: true,
		autoIndex: false,
	})
	.then(_ => console.log("\nMongoDB Connected...\n"))
	.catch(err => console.error(err))

app.use("/api/users", require("./routes/api/users"))
app.use("/api/decks", require("./routes/api/decks"))
app.use("/api/auth", require("./routes/api/auth"))

app.listen(port, _ => console.log(`\nServer is running on port: ${port}\n`))
