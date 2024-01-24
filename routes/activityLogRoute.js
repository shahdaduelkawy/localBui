const express = require('express');
const router = express.Router();
const { getActivities } = require('../services/activityLogService');

router.get('/activities/:userId', async (req, res) => {
  const userId = req.params.userId;

  try {
    const activities = await getActivities(userId);

    if (activities !== null) {
      // Set Cache-Control header to disable caching
      res.setHeader('Cache-Control', 'no-store');

      console.log('Fetched activities for userId:', userId);
      console.log('Number of activities:', activities.length);

      res.status(200).json({ success: true, activities });
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
