const express = require('express');
const {
  firstBusiness,
} = require('../utils/validators/ownerValidator');

const {
    firstBusiness,
} = require('../services/ownerService');

const router = express.Router();

router.post('/firstBusiness', firstBusinessValidator, firstBusiness);


module.exports = router;
