
const express = require('express');
const {
  createAdminValidator,
  deleteAdminValidator,
  getSearchValidator,
} = require('../utils/validators/adminValidator');
const { getActivities } = require('../services/activityLogService');

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
router.get('/activities/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const { activities, activityCount, mostCommonAction } = await getActivities(userId);

    if (activities.length !== 0) {
      // Set Cache-Control header to disable caching
      res.setHeader('Cache-Control', 'no-store');

      console.log('Fetched activities for userId:', userId);
      console.log('Number of activities:', activityCount);
      console.log('Most common action:', mostCommonAction);

      res.status(200).json({ success: true, activityCount, mostCommonAction, activities });
    } else {
      console.log('No activities found for userId:', userId);
      res.status(404).json({ success: false, message: 'No activities found' });
    }
  } catch (err) {
    console.error('Error retrieving activities:', err);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});
module.exports = router;
