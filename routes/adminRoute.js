
const express = require('express');

const {
   searchUserByName ,
  updateBusinessOwnerStatus ,
  searchReviewsByContent ,
  searchbusinessByName 
} = require('../services/adminService');


const {
  createAdminValidator,
  deleteAdminValidator,
} = require('../utils/validators/adminValidator');
const { getActivities } = require('../services/activityLogService');

const {
  createAdmin,
  deleteAdmin,
  getRequests,
  deleteReview,
  getreports,
} = require('../services/adminService');

const authService = require('../services/authService');

const router = express.Router();

router.use(authService.protect);

// Admin
router.use(authService.allowedTo('admin', 'subAdmin'));

// Define the route to accept or decline business owner requests
router.put('/managebusinesses/:businessId', async (req, res) => {
  const { businessId } = req.params;
  const { status } = req.body;

  try {
    const updatedBusinessOwner = await updateBusinessOwnerStatus(businessId, status);
    res.json(updatedBusinessOwner);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router
  .route('/')
  .get(getRequests)
  .get(getreports)
  .post(createAdminValidator, createAdmin);
router
  .route('/delete/:id')
  .delete(deleteAdminValidator, deleteAdmin); 

router.route('/deleteReview/:id').delete(deleteReview); 
router.route('/getreports').get(getreports); 
router.get('/activities/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const { activities, activityCount, mostCommonAction, userName } = await getActivities(userId);

    if (activities.length !== 0) {
      // Set Cache-Control header to disable caching
      res.setHeader('Cache-Control', 'no-store');
      console.log('Name of user:', userName);

      console.log('Fetched activities for userId:', userId);
      console.log('Number of activities:', activityCount);
      console.log('Most common action:', mostCommonAction);

      res.status(200).json({ success: true, activityCount, mostCommonAction, activities, userName });
    } else {
      console.log('No activities found for userId:', userId);
      res.status(404).json({ success: false, message: 'No activities found' });
    }
  } catch (err) {
    console.error('Error retrieving activities:', err);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});
router.get('/searchUserByName/:name', searchUserByName);
router.get('/searchUserByName', searchUserByName);
router.get('/searchReviewsByContent', searchReviewsByContent);
router.get('/searchbusinessByName/:businessName', searchbusinessByName);
router.get('/searchbusinessByName', searchbusinessByName);



module.exports = router;
