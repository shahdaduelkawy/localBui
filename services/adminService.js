const asyncHandler = require("express-async-handler");
const { v4: uuidv4 } = require("uuid");
const sharp = require("sharp");
const bcrypt = require("bcryptjs");
const BusinessOwner = require("../models/businessOwnerModel");

const factory = require("./handlersFactory");
const ApiError = require("../utils/apiError");
const createToken = require("../utils/createToken");
const User = require("../models/userModel");

exports.createAdmin = factory.createOne(User);

exports.deleteAdmin = factory.deleteOne(User);
 
exports.getSearch = factory.getOne(User);

exports.getRequests = factory.getAll(BusinessOwner);
