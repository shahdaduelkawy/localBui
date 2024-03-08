const factory = require("./handlersFactory");

const User = require("../models/userModel");
const businessOwner = require("../models/businessOwnerModel");
const reportReviewModel = require("../models/reportReviewModel");



exports.createAdmin = factory.createOne(User);

exports.deleteAdmin = factory.deleteOne(User);
 
exports.getSearch = factory.getOne(User);

exports.getRequests = factory.getAll(businessOwner);

exports.getreports = factory.getAll(reportReviewModel);


exports.deleteReview = factory.deleteOne(reportReviewModel)
  
