const express = require('express');

const {
  createAdminValidator,
  deleteAdminValidator,
 
} = require('../utils/validators/adminValidator');

const {

  createAdmin,
  deleteAdmin,
 
} = require('../services/adminService');

const authService = require('../services/authService');

const router = express.Router();

router.use(authService.protect);


// Admin
router.use(authService.allowedTo('subAdmin'));
router
  .route('/')
  .post(createAdminValidator, createAdmin);
router
  .route('/:id')
  .delete(deleteAdminValidator, deleteAdmin);

module.exports = router;
