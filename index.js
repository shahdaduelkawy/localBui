// index.js
/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
/* eslint-disable no-use-before-define */
/* eslint-disable import/no-extraneous-dependencies */
const socketIO = require('socket.io');

const path = require('path');
require('dotenv').config({ path: './config.env' });
const express = require("express");
// eslint-disable-next-line no-unused-vars
const dotenv = require('dotenv');
const morgan = require('morgan');
const cors = require('cors');

const ApiError = require('./utils/apiError');
const globalError = require('./middleware/errorMiddleware');
const dbConnection = require('./config/db');
const { initializeSocket } = require('./services/socket');

// Routes
const authRoute = require('./routes/authRoute');
const adminRoute = require('./routes/adminRoute');
const businessOwnerRoute = require('./routes/businessOwnerRoute');
const customerRoute = require('./routes/customerRoute');
const activityLogRoute = require('./routes/activityLogRoute');

// Express app
const app = express();

// Middlewares
app.use(express.json());
app.use(express.static(path.join(__dirname, 'uploads')));
app.use(cors());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
  console.log(`mode: ${process.env.NODE_ENV}`);
}

// Connect to db
dbConnection();

// Create HTTP server
const server = app.listen(process.env.PORT || 8000, () => {
  console.log(`App running on port ${process.env.PORT || 8000}`);
});

// Initialize Socket.io
initializeSocket(server);

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

// Handle rejection outside express
process.on('unhandledRejection', (err) => {
  console.error(`UnhandledRejection Errors: ${err.name} | ${err.message}`);
  server.close(() => {
    console.error(`Shutting down....`);
    process.exit(1);
  });
});
