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
  async uploadedmedia(ownerID, files) {
    try {
      const updateResults = await Promise.all(
        files.map(async (file) => {
          const updateResult = await BusinessOwner.updateOne(
            { userId: ownerID },
            { $push: { media: file.path } } // Assuming 'media' is an array in the BusinessOwner schema
          );
          return updateResult;
        })
      );

      return updateResults;
    } catch (error) {
      return error.message;
    }
  },
  async updateUserBusiness(ownerID, updateCriteria) {
    try {
      const updatedOwner = await BusinessOwner.findOneAndUpdate(
        {
          userId: ownerID,
        },
        updateCriteria,
        { new: true, upsert: true } // Create a new document if not found
      );

      return updatedOwner;
    } catch (error) {
      console.error("Error updating user business:", error);
      return null;
    }
  },

  async profileSetup(ownerID, updateCriteria) {
    try {
      const profileSetup = await BusinessOwner.findOneAndUpdate(
        {
          userId: ownerID,
        },
        updateCriteria,
        { new: true, upsert: true } // Create a new document if not found
      );

      return profileSetup;
    } catch (error) {
      console.error("Error updating user business:", error);
      return null;
    }
  },
};

module.exports = BusinessOwnerService;
