// server.js - Express server for bbfiller
const express = require("express")
const path = require("path")
const fs = require("fs")

const app = express()
const PORT = process.env.PORT || 3000

// Serve static files from the public directory
app.use(express.static("public"))

// Serve files from the dist directory (for webpack output)
app.use("/dist", express.static("public/dist"))

// API endpoint for projects data
app.get("/api/projects", (req, res) => {
  try {
    const projectsData = fs.readFileSync(path.join(__dirname, "public", "projects.json"), "utf8")
    res.json(JSON.parse(projectsData))
  } catch (error) {
    console.error("Error reading projects data:", error)
    res.status(500).json({ error: "Failed to load projects data" })
  }
})

// Catch-all route to serve index.html for client-side routing
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"))
})

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
  console.log(`Visit http://localhost:${PORT} to view the application`)
})
