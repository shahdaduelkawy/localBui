const path = require('path');
require('dotenv').config({ path: './config.env' });


const express = require("express");
const dotenv = require('dotenv');
const morgan = require('morgan');

dotenv.config({ path: 'config.env' });
const ApiError = require('./utils/apiError');
const globalError = require('./middleware/errorMiddleware');
const dbConnection = require('./config/db');

//Routes
const userRoute = require('./routes/userRoute');
const authRoute = require('./routes/authRoute');
const categoryRoute = require('./routes/categoryRoutes');

// connect db
dbConnection();

// express app
const app = express();

// Middlewares
app.use(express.json());
app.use(express.static(path.join(__dirname, 'uploads')));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
  console.log(`mode: ${process.env.NODE_ENV}`);
}

// Mount Routes
app.use('/api/v1/categories', categoryRoute);
app.use('/users', userRoute);
app.use('/auth', authRoute);

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
process.on('unhandledRejection', (err) => {
  console.error(`UnhandledRejection Errors: ${err.name} | ${err.message}`);
  index.close(() => {
    console.error(`Shutting down....`);
    process.exit(1);
  });
});
