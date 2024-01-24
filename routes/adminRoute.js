const express = require('express');

const {
  createAdminValidator,
  deleteAdminValidator,
  getSearchValidator,
 
} = require('../utils/validators/adminValidator');

const {
  getRequests,
  createAdmin,
  deleteAdmin,
  getSearch,
 
} = require('../services/adminService');

const authService = require('../services/authService');

const router = express.Router();

router.use(authService.protect);


// Admin
router.use(authService.allowedTo('admin','subAdmin'));
router
  .route('/')
  .get(getRequests)
  .post(createAdminValidator, createAdmin);
router
.route('/delete/:id')
.delete(deleteAdminValidator, deleteAdmin);
router
.route('/Search/:id')
.get(getSearchValidator, getSearch);

module.exports = router;
