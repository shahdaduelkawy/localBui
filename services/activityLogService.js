const Activity = require("../models/activityModel");

async function logActivity(userId, activityType, details) {
  try {
    const activity = new Activity({
      userId,
      activityType,
      details,
    });

    await activity.save();
    console.log("Activity logged:", activity);
  } catch (error) {
    console.error("Error logging activity:", error);
  }
}

async function getActivities(userId) {
  try {
    const activities = await Activity.find({ userId }).sort({ timestamp: -1 });
    return activities;
  } catch (error) {
    console.error("Error retrieving activities:", error);
    throw error;
  }
}

module.exports = {logActivity,getActivities}
