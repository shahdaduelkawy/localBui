
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
  getRequests,
  deleteReview,
  getreports,
} = require('../services/adminService');

const authService = require('../services/authService');

const router = express.Router();

router.use(authService.protect);

// Admin
router.use(authService.allowedTo('admin', 'subAdmin'));
router
  .route('/')
  .get(getRequests)
  .get(getreports)
  .post(createAdminValidator, createAdmin);
router
  .route('/delete/:id')
  .delete(deleteAdminValidator, deleteAdmin); 
router
  .route('/Search/:id')
  .get(getSearchValidator, getSearch);

router.route('/deleteReview/:id').delete(deleteReview); 
router.route('/getreports').get(getreports); 

module.exports = router;
