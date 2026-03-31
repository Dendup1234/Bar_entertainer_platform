import express from "express";
import connectDB from "./config/db.js";
import dotenv from "dotenv";
import entertainerRoute from "./routes/entertainer.js";
import organizerRoute from "./routes/organizer.js";
// defining the imports
const app = express();
app.use(express.json());
dotenv.config();

// env variables
const PORT = process.env.PORT;

// Routes
app.get("/", (req, res) => {
  res.send("Hello World from Express!");
});

//Routes
app.use("/api/entertainer", entertainerRoute);
app.use("/api/bar", organizerRoute);

await connectDB();

// Start the server and listen on the specified port
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
