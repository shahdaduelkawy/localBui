const express = require("express");
const customer = require("../services/customerService");
const router = express.Router();

router.get("/searchBusinesses/:businessName", customer.searchBusinessesByName);

module.exports = router;