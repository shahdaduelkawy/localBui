const express = require('express');

const {
  createAdminValidator,
  deleteAdminValidator,
  getSearchValidator,
 
} = require('../utils/validators/adminValidator');

const {

  createAdmin,
  deleteAdmin,
  getSearch,
 
} = require('../services/adminService');

const authService = require('../services/authService');

const router = express.Router();

router.use(authService.protect);


// Admin
router.use(authService.allowedTo('admin'));
router
  .route('/')
  .post(createAdminValidator, createAdmin);
router
  .route('/Search/:id')
  .delete(deleteAdminValidator, deleteAdmin)
  .get(getSearchValidator, getSearch);

module.exports = router;
