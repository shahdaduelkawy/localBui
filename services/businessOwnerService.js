/* eslint-disable radix */
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
  async getBusinessesNearby(longitude, latitude, minDistance, maxDistance) {
    try {
      // Convert longitude and latitude to numbers
      const longitudeNum = parseFloat(longitude);
      const latitudeNum = parseFloat(latitude);

      // Ensure valid longitude and latitude values
      if (Number.isNaN(longitudeNum) || Number.isNaN(latitudeNum)) {
        throw new Error("Invalid longitude or latitude values");
      }

      // Convert minDistance and maxDistance to numbers
      const minDistanceNum = parseInt(minDistance);
      const maxDistanceNum = parseInt(maxDistance);

      // Perform the MongoDB query using the provided parameters
      const businessOwners = await BusinessOwner.find({
        business: {
          $near: {
            $geometry: {
              type: "Point",
              coordinates: [longitudeNum, latitudeNum],
            },
            $minDistance: minDistanceNum,
            $maxDistance: maxDistanceNum,
          },
        },
      });

      return businessOwners;
    } catch (error) {
      console.error("Error getting nearby businesses:", error);
      throw error;
    }
  },
};

module.exports = BusinessOwnerService;
