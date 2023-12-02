const express = require("express"); 
 
const { getCategory } = require('../services/categoryService');

const router = express.Router();

router.post('/', getCategory);


module.exports = router;