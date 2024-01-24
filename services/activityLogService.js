const Activity = require("../models/activityModel");
async function logActivity(userID, activityType, details) {
  try {
    const activity = new Activity({
      userID: userID, // Update the field name to match the schema
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
    const activities = await Activity.find({ userID }).sort({ timeStamp: -1 });
    return activities;
  } catch (error) {
    console.error("Error retrieving activities:", error);
    throw error;
  }
}

module.exports = {logActivity,getActivities}
