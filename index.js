const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const customerRoutes = require("./routes/customerRouter");

dotenv.config({ path: "config.env" });
const ApiError = require("./utils/apiError");
const globalError = require("./middleware/errorMiddleware");
const dbConnection = require("./config/db");

//Routes
const authRoute = require("./routes/authRoute");
const adminRoute = require("./routes/adminRoute");
const businessOwnerRoute = require("./routes/businessOwnerRoute");

// connect db
dbConnection();

// express app
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

// Mount Routes
app.use("/businessOwner", businessOwnerRoute);
app.use("/admin", adminRoute);
app.use("/auth", authRoute);

app.all("*", (req, res, next) => {
  next(new ApiError(`Can't find this route: ${req.originalUrl}`, 400));
});

// Global error handling middleware for express
app.use(globalError);

const PORT = process.env.PORT || 3011;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Handle rejection outside express
process.on("unhandledRejection", (err) => {
  console.error(`UnhandledRejection Errors: ${err.name} | ${err.message}`);
  // eslint-disable-next-line no-undef
  index.close(() => {
    console.error(`Shutting down....`);
    process.exit(1);
  });
});
