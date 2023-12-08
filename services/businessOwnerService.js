const BusinessOwner = require("../models/businessOwnerModel");

const BusinessOwnerService = {
  async getUserBusiness(ownerID) {
    try {
      const businessData = await BusinessOwner.findOne({ userId: ownerID });

      return businessData;
    } catch (error) {
      console.error("Error retrieving user business:", error);
      return null;
    }
  },

  async updateUserBusiness(ownerID,updatedUserData) {
    try {
      const updateResult = await BusinessOwner.updateOne(
        { userId: ownerID },
        updatedUserData
      );

      return updateResult;
    } catch (error) {
      console.error("Error updating user business:", error);
      return null;
    }
  },
};

module.exports = BusinessOwnerService;
