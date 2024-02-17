const path = require('path');
require('dotenv').config({ path: './config.env' });
const express = require("express");
const dotenv = require('dotenv');
const morgan = require('morgan');
const cors = require('cors')

dotenv.config({ path: 'config.env' });
const ApiError = require('./utils/apiError');
const globalError = require('./middleware/errorMiddleware');
const dbConnection = require('./config/db');

//Routes
const authRoute = require('./routes/authRoute');
const adminRoute = require('./routes/adminRoute');
const businessOwnerRoute = require('./routes/businessOwnerRoute');
const customerRoute = require('./routes/customerRoute');
const activityLogRoute = require('./routes/activityLogRoute');


// connect db
dbConnection();

// express app
const app = express();

// Middlewares
app.use(express.json());
app.use(express.static(path.join(__dirname, 'uploads')));
app.use(cors())

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
  console.log(`mode: ${process.env.NODE_ENV}`);
}

// Mount Routes
app.use('/businessOwner', businessOwnerRoute);
app.use('/admin', adminRoute);
app.use('/auth', authRoute);
app.use('/customer', customerRoute);
app.use('/log', activityLogRoute);


// Move the wildcard route to the end
app.all('*', (req, res, next) => {
  next(new ApiError(`Can't find this route: ${req.originalUrl}`, 400));
});

// Global error handling middleware for express
app.use(globalError);

const PORT = process.env.PORT || 8000;
const server = app.listen(PORT, () => {
  console.log(`App running running on port ${PORT}`);
});

// Handle rejection outside express
process.on('unhandledRejection', (err) => {
  console.error(`UnhandledRejection Errors: ${err.name} | ${err.message}`);
  server.close(() => {
    console.error(`Shutting down....`);
    process.exit(1);
  });
});