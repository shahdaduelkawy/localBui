const BusinessOwner = require("../models/businessOwnerModel");
const Customer = require("../models/customerModel");

const User = require("../models/userModel");
const ApiError = require('../utils/apiError');

const { logActivity } = require("./activityLogService");


const BusinessOwnerService = 
{
  async sendMessageToCustomer(ownerId, customerId, message) {

    try {
  
     // Check if the business owner exists
  
     const businessOwner = await BusinessOwner.findOne({ userId: ownerId });
  
    
  
     if (!businessOwner) {
  
      throw new ApiError(`Business owner not found for ID: ${ownerId}`, 404);
  
     }
  
    
  
     // Check if the customer exists
  
     const customer = await Customer.findOne({ userId: customerId });
  
    
  
     if (!customer) {
  
      throw new ApiError(`Customer not found for ID: ${customerId}`, 404);
  
     }
  
    
  
     // Ensure `messages` arrays exist and are not empty
  
     businessOwner.messages = Array.isArray(businessOwner.messages) ? businessOwner.messages : [];
  
     customer.messages = Array.isArray(customer.messages) ? customer.messages : [];
  
    
  
     // Create the message objects consistently
  
     const businessOwnerMessage = {
  
      sender: 'businessOwner',
  
      content: message,
  
      timestamp: new Date(),
  
     };
  
    
  
     const customerMessage = {
  
      sender: 'businessOwner',
  
      content: message, // Ensure content is set correctly
  
      timestamp: new Date(),
  
     };
  
    
  
     // Push messages into the arrays
  
     businessOwner.messages.push(businessOwnerMessage);
  
     customer.messages.push(customerMessage);
  
    
  
     // Ensure data is saved to the database
  
     await businessOwner.save();
  
     await customer.save();
  
    
  
     // Log activity after saving for consistency
  
     await logActivity(ownerId, "sendMessageToCustomer", "Message sent successfully");
  
    
  
     // Return the updated messages and status
  
     return {
  
      success: true,
  
      message: "Message sent successfully",
  
      businessOwnerMessages: businessOwner.messages,
  
      customerMessages: customer.messages,
  
     };
  
    } catch (error) {
  
     console.error(`Error sending message: ${error.message}`);
  
     throw new ApiError("Error sending message", error.statusCode || 500);
  
    }
  
  },
  async getUserByUserID(userId) {
    try {
      // Find the user based on the user's ID
      const user = await User.findOne({ _id: userId });
  
      if (!user) {
        throw new ApiError('User not found for the given userId', 404);
      }
  
      // Include the `userProfile` field in the sanitized user object
      const sanitizedUser = {
        _id: user._id,
        name: user.name,
        email: user.email,
        birthday: user.birthday,
        role: user.role,
        gender: user.gender,
        phone: user.phone,
        userProfile: user.userProfile, // Include the userProfile field
      };
  
      return sanitizedUser;
    } catch (error) {
      console.error("Error getting user data by userId:", error);
  
      if (error instanceof ApiError) {
        throw error;
      } else {
        throw new ApiError("Internal Server Error", 500);
      }
    }
  },
  async uploadedmedia(businessId, files) {
    try {
      const updateResults = await Promise.all(
        files.map(async (file) => {
          const updateResult = await BusinessOwner.updateOne(
            { _id: businessId },
            { $push: { media: file.path } } // Assuming 'media' is an array in the BusinessOwner schema
          );
          return updateResult;
        })
      );
      await logActivity(businessId, "uploadedmedia", "Media uploaded successfully");

      return updateResults;
    } catch (error) {
      return error.message;
    }
  },
  async profileSetup(businessId, updateCriteria) {
    try {
      const profileSetup = await BusinessOwner.findOneAndUpdate(
        {
          _id: businessId,
        },
        updateCriteria,
        {new: true, upsert: true  } // Return the modified document
      );
  
      if (!profileSetup) {
        // If profileSetup is null, the business with the given ID was not found
        console.error("Business not found with ID:", businessId);
        return null;
      }
  
      await logActivity(businessId, "profileSetup", "Profile setup completed successfully");
  
      return profileSetup;
    } catch (error) {
      console.error("Error updating user business:", error);
      return null;
    }
  },
  
  async pinBusinessOnMap(businessId, coordinates) {
    try {
      const businessOwner = await BusinessOwner.findOne({ _id: businessId });

      if (!businessOwner) {
        throw new Error("Business owner not found");
      }

      businessOwner.business = {
        type: "Point",
        coordinates: coordinates,
      };

      await businessOwner.save();
      await logActivity(businessId, "pinBusinessOnMap", "Business location pinned successfully");

      console.log("Business location pinned successfully");
    } catch (error) {
      console.error(
        `Error pinning business on map for owner ${businessId}: ${error.message}`
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


