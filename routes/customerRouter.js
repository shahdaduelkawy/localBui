const express = require("express");
const customer = require("../services/customerService");
const uploadSingleImage =
  require("../middleware/uploadImageMiddleware").uploadSingleImage;

module.exports = router;
