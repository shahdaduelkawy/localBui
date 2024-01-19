const BusinessOwner = require("../models/businessOwnerModel");

const BusinessOwnerService = {
  async getUserBusiness(ownerID) {
    try {
      const businessData = await BusinessOwner.findOne({
        userId: ownerID,
      });

      return businessData;
    } catch (error) {
      console.error("Error retrieving user business:", error);
      return null;
    }
  },

  async updateUserBusiness(ownerID, updatedUserData) {
    try {
      const updateResult = await BusinessOwner.updateOne(
        {
          userId: ownerID,
        },
        updatedUserData
      );

      return updateResult;
    } catch (error) {
      console.error("Error updating user business:", error);
      return null;
    }
  },

  async uploadImage(ownerID, file) {
    try {
      const updateResult = await BusinessOwner.updateOne(
        {
          userId: ownerID,
        },
        {
          attachment: file.path,
        }
      );

      return updateResult;
    } catch (error) {
      return error.message;
    }
  },

  async pinBusinessOnMap(ownerID, coordinates) {
    try {
      const businessOwner = await BusinessOwner.findOne({ userId: ownerID });

      if (!businessOwner) {
        throw new Error("Business owner not found");
      }

      businessOwner.business = {
        type: "Point",
        coordinates: coordinates,
      };

      await businessOwner.save();

      console.log("Business location pinned successfully");
    } catch (error) {
      console.error(
        `Error pinning business on map for owner ${ownerID}: ${error.message}`
      );
    }
  },
};

module.exports = BusinessOwnerService;
