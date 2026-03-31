import express from "express";
import connectDB from "./config/db.js";
import dotenv from "dotenv";

// defining the imports
const app = express();
dotenv.config();

// env variables
const PORT = process.env.PORT;

// Routes
app.get("/", (req, res) => {
  res.send("Hello World from Express!");
});

await connectDB();

// Start the server and listen on the specified port
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
