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
  
        return updatedOwner;
      } else {
        // If no business exists, create a new document
        const newBusiness = await BusinessOwner.create({
          userId: ownerID,
          ...updateCriteria,
        });
  
        return newBusiness;
      }
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
      for (const businessData of businessesArray) {
        const newBusiness = await BusinessOwner.create({
          userId: ownerID,
          ...businessData,
        });
  
        createdBusinesses.push(newBusiness);
      }
  
      return createdBusinesses;
    } catch (error) {
      console.error("Error adding businesses:", error);
      return null;
    }
  },
  // Inside BusinessOwnerService

// Inside BusinessOwnerService

async getAllUserBusinesses(ownerID) {
  try {
    const businesses = await BusinessOwner.find({ userId: ownerID });
    const count = await BusinessOwner.countDocuments({ userId: ownerID });

    return { count, businesses };
  } catch (error) {
    console.error("Error retrieving user businesses:", error);
    return null;
  }const result = await BusinessOwnerService.getAllUserBusinesses(ownerID);

  if (result) {
    const { count, businesses } = result;
    console.log(`Number of results: ${count}`);
    console.log(`Businesses:`, businesses);
  } else {
    console.error("Error retrieving user businesses.");
  }
  
},

  
};
module.exports = BusinessOwnerService;


