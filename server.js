const express = require("express")
const mongoose = require("mongoose")
const config = require("config")

const app = express()
const port = process.env.PORT || 5000

app.use(express.json())

mongoose
	.connect(config.get("mongoUri"))
	.then(_ => console.log("\nMongoDB Connected...\n"))
	.catch(err => console.error(err))

app.use("/api/users", require("./routes/api/users"))
app.use("/api/decks", require("./routes/api/decks"))
app.use("/api/auth", require("./routes/api/auth"))

app.listen(port, _ => console.log(`\nServer is running on port: ${port}\n`))
