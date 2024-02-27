const factory = require("./handlersFactory");

const User = require("../models/userModel");
const businessOwner = require("../models/businessOwnerModel");


exports.createAdmin = factory.createOne(User);

exports.deleteAdmin = factory.deleteOne(User);
 
exports.getSearch = factory.getOne(User);

exports.getRequests = factory.getAll(businessOwner);
