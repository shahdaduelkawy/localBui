/* eslint-disable import/no-extraneous-dependencies */
const path = require("path");
require("dotenv").config({ path: "./config.env" });
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");

const session = require("express-session");

const ApiError = require("./utils/apiError");
const globalError = require("./middleware/errorMiddleware");
const dbConnection = require("./config/db");
const { initializeSocket } = require("./services/socket");

// Routes
const authRoute = require("./routes/authRoute");
const adminRoute = require("./routes/adminRoute");
const businessOwnerRoute = require("./routes/businessOwnerRoute");
const customerRoute = require("./routes/customerRoute");
const reportReviewRoute = require("./routes/reportReviewRoute");


// Express app
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create session
app.use(session({
  secret: 'yOur to-do-app sessions',
  cookie: { maxAge: 24 * 60 * 60 * 1000 },
  resave: true,
  saveUninitialized: true
}));

// Middlewares
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
  console.log(`mode: ${process.env.NODE_ENV}`);
}

app.use(cors());
app.use(express.json());
app.use("/img", express.static("img/"));
app.use(express.static(path.join(__dirname, "img")));

// Connect to db
dbConnection();

// Create HTTP server
const server = app.listen(process.env.PORT || 8000, () => {
  console.log(`App running on port ${process.env.PORT || 8000}`);
});

// Initialize Socket.io
initializeSocket(server);

// Mount Routes
app.use("/businessOwner", businessOwnerRoute);
app.use("/admin", adminRoute);
app.use("/auth", authRoute);
app.use("/customer", customerRoute);
app.use("/report", reportReviewRoute);

// Move the wildcard route to the end
app.all("*", (req, res, next) => {
  next(new ApiError(`Can't find this route: ${req.originalUrl}`, 400));
});

// Global error handling middleware for express
app.use(globalError);

// Handle rejection outside express
process.on("unhandledRejection", (err) => {
  console.error(`UnhandledRejection Errors: ${err.name} | ${err.message}`);
  server.close(() => {
    console.error(`Shutting down....`);
    process.exit(1);
  });
});
