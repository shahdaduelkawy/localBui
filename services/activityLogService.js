const Activity = require("../models/activityModel");

async function logActivity(userID, activityType, details) {
  try {
    const activity = new Activity({
      userID: userID,
      activityType,
      details,
    });

    await activity.save();
    console.log("Activity logged:", activity);
  } catch (error) {
    console.error("Error logging activity:", error);
  }
}

async function getActivities(userID) {
  try {
    const activities = await Activity.find({ userID }).sort({ timeStamp: -1 }).populate('userID', 'name');
    const activityCount = activities.length;

    // Calculate the most common action
    const actionCounts = activities.reduce((acc, activity) => {
      acc[activity.activityType] = (acc[activity.activityType] || 0) + 1;
      return acc;
    }, {});

    const mostCommonAction = Object.keys(actionCounts).reduce((a, b) =>
      actionCounts[a] > actionCounts[b] ? a : b
    );

    return { activities, activityCount, mostCommonAction, userName: activities[0].userID.name };
  } catch (error) {
    console.error("Error retrieving activities:", error);
    throw error;
  }
}

module.exports = { logActivity, getActivities };
