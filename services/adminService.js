const asyncHandler = require('express-async-handler');
const factory = require("./handlersFactory");

const User = require("../models/userModel");
const businessOwner = require("../models/businessOwnerModel");
const reportReviewModel = require("../models/reportReviewModel");
const ApiError = require('../utils/apiError');


exports.createAdmin = factory.createOne(User);

exports.deleteAdmin = factory.deleteOne(User);
exports.getRequests = factory.getAll(businessOwner);

exports.getreports = factory.getAll(reportReviewModel);


exports.deleteReview = factory.deleteOne(reportReviewModel)
  
exports.searchUserByName = asyncHandler(async (req, res, next) => {
    const { name } = req.params;
  
    // If name is not provided, set it to an empty string to retrieve all users
    const regex = new RegExp(name || '', 'i');
  
    // Search for users with names matching the provided term
    const users = await User.find({ name: regex });
  
    // Check if users were found
    if (users.length === 0) {
      return next(new ApiError(`No users found for the given search term ${name}`, 404));
    }
  
    // Return the number of users found along with the list of users
    res.status(200).json({ success: true, count: users.length, users });
  });
  