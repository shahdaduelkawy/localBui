const path = require("path");
require("dotenv").config({ path: "./config.env" });

const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");

dotenv.config({ path: "config.env" });
const ApiError = require("./utils/apiError");
const globalError = require("./middleware/errorMiddleware");
const dbConnection = require("./config/db");

//Routes
const authRoute = require('./routes/authRoute');
const adminRoute = require('./routes/adminRoute');
const businessOwnerRoute = require('./routes/businessOwnerRoute');
const customerRouter = require('./routes/customerRouter');


// connect db
dbConnection();

// express app
const app = express();

// Middlewares
app.use(express.json());
app.use(express.static(path.join(__dirname, "uploads")));

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
  console.log(`mode: ${process.env.NODE_ENV}`);
}

// Mount Routes
app.use('/businessOwner', businessOwnerRoute);
app.use('/admin', adminRoute);
app.use('/auth', authRoute);
app.use('/customer', customerRouter);



app.all('*', (req, res, next) => {
  next(new ApiError(`Can't find this route: ${req.originalUrl}`, 400));
});

// Global error handling middleware for express
app.use(globalError);

const PORT =  process.env.PORT || 3011;
app.listen(PORT, () => {
  console.log(`Server is running on port num ${PORT}`);
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