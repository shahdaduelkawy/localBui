const express = require("express");
const mongoose = require("mongoose");
const customerRoutes = require("./routes/customerRouter");
const dotenv = require("dotenv");
dotenv.config({ path: "./.env" });

const app = express();

// Connect to MongoDB
const DB = process.env.DATABASE_URI.replace(
  "DATABASE_PASSWORD",
  process.env.DATABASE_PASSWORD
);
mongoose.connect(DB, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Customer Routes
app.use(customerRoutes);

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Close MongoDB connection on application termination
process.on("SIGINT", () => {
  mongoose.connection.close(() => {
    console.log("MongoDB connection closed");
    process.exit(0);
  });
});
