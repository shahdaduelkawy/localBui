/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
const BusinessOwner = require("../models/businessOwnerModel");
const { logActivity } = require("./activityLogService");


const BusinessOwnerService = 
{
  async getUserBusiness(ownerID) {
    try {
      const businessData = await BusinessOwner.findOne({
        userId: ownerID,
      });
      await logActivity(ownerID, "getUserBusiness", "User business retrieved successfully");

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
      await logActivity(ownerID, "uploadImage", "Image uploaded successfully");

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
      await logActivity(ownerID, "uploadedmedia", "Media uploaded successfully");

      return updateResults;
    } catch (error) {
      return error.message;
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
      await logActivity(ownerID, "profileSetup", "Profile setup completed successfully");

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
      await logActivity(ownerID, "pinBusinessOnMap", "Business location pinned successfully");

      console.log("Business location pinned successfully");
    } catch (error) {
      console.error(
        `Error pinning business on map for owner ${ownerID}: ${error.message}`
      );
    }
  },
  async updateUserBusiness(ownerID, updateCriteria) {
    try {
      // Check if a business for the given userId already exists
      const existingBusiness = await BusinessOwner.findOne({ userId: ownerID });
  
      if (existingBusiness) {
        // If a business exists, update the existing document
        const updatedOwner = await BusinessOwner.findOneAndUpdate(
          { userId: ownerID },
          updateCriteria,
          { new: true, upsert: true } // Update the existing document
        );
        await logActivity(ownerID, "updateUserBusiness", "New user business created successfully");
        return updatedOwner;
      } 
        // If no business exists, create a new document
        const newBusiness = await BusinessOwner.create({
          userId: ownerID,
          ...updateCriteria,
        });

        await logActivity(ownerID, "updateUserBusiness", "New user business created successfully");

        return newBusiness;
      
    } catch (error) {
      console.error("Error updating user business:", error);
      return null;
    }
  },
  async addMultipleBusinesses(ownerID, businessesData) {
    try {
      // If it's not an array, convert it to an array with a single element
      const businessesArray = Array.isArray(businessesData) ? businessesData : [businessesData];
  
      // Create an array to store the created businesses
      const createdBusinesses = [];
  
      // Iterate over the array of businesses and create each one
      // eslint-disable-next-line no-restricted-syntax
      for (const businessData of businessesArray) {
        // eslint-disable-next-line no-await-in-loop
        const newBusiness = await BusinessOwner.create({
          userId: ownerID,
          ...businessData,
        });
  
        createdBusinesses.push(newBusiness);
      }
      await logActivity(ownerID, "addMultipleBusinesses", "Multiple businesses added successfully");

      return createdBusinesses;
    } catch (error) {
      console.error("Error adding businesses:", error);
      return null;
    }
  },
async getAllUserBusinesses(ownerID) {
  try {
    const businesses = await BusinessOwner.find({ userId: ownerID });
    const numberOfBusinesses = await BusinessOwner.countDocuments({ userId: ownerID });
    await logActivity(ownerID, "getAllUserBusinesses", "All user businesses retrieved successfully");

    return { numberOfBusinesses, businesses };
  } catch (error) {
    console.error("Error retrieving user businesses:", error);
    return null;
  }
  }, 
async addLogo(ownerID, logoFile) {
    try {
      const updateResult = await BusinessOwner.updateOne(
        { userId: ownerID },
        { logo: logoFile.path } // Assuming 'logo' is a field in the BusinessOwner schema
      );

      return updateResult;
    } catch (error) {
      console.error("Error adding logo to business:", error);
      return null;
    }
  },
  async deleteBusinessById(businessId) {
    try {
      const deletionResult = await BusinessOwner.deleteOne({ _id: businessId });

      return deletionResult;
    } catch (error) {
      console.error("Error deleting business:", error);
      return null;
    }
  },
};
module.exports = BusinessOwnerService;

