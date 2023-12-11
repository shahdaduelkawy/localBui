const express = require("express");
const customer = require("../services/customerService");
const uploadSingleImage =
  require("../middleware/uploadImageMiddleware").uploadSingleImage;

const router = express.Router();

// Upload customer profile image route
router.post(
  "/:customerId/upload-image",
  uploadSingleImage("profileImage"),
  customer.uploadCustomerImage
);

module.exports = router;
