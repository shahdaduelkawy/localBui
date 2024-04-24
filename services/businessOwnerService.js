/* eslint-disable radix */
/* eslint-disable no-useless-catch */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
const BusinessOwner = require("../models/businessOwnerModel");
const Customer = require("../models/customerModel");

const User = require("../models/userModel");
const ApiError = require('../utils/apiError');
const service=require('../models/serviceRequestModel');
const { logActivity } = require("./activityLogService");




const BusinessOwnerService = 
{
  async sendMessageToCustomer(businessId, customerId, message) {
    try {
        // Check if the business owner exists
        const businessOwner = await BusinessOwner.findById(businessId); // Remove curly braces around businessId
        if (!businessOwner) {
            throw new ApiError(`Business owner not found for ID: ${businessId}`, 404);
        }

        // Check if the customer exists
        const customer = await Customer.findOne({ userId: customerId });
        if (!customer) {
            throw new ApiError(`Customer not found for ID: ${customerId}`, 404);
        }

        const user = await User.findById(businessOwner.userId);
        if (!user) {
            return { success: false, message: "User not found" };
        }

        const businessOwnerName = user.name;

        // Ensure `messages` arrays exist and are not empty
        businessOwner.messages = Array.isArray(businessOwner.messages) ? businessOwner.messages : [];
        customer.messages = Array.isArray(customer.messages) ? customer.messages : [];

        // Create the message objects consistently
        const businessOwnerMessage = {
            sender: 'businessOwner',
            content: message,
            timestamp: new Date(),
            userName: businessOwnerName,
        };

        const customerMessage = {
            sender: 'businessOwner',
            content: message, // Ensure content is set correctly
            timestamp: new Date(),
            userName: businessOwnerName,
        };

        // Push messages into the arrays
        businessOwner.messages.push(businessOwnerMessage);
        customer.messages.push(customerMessage);

        // Ensure data is saved to the database
        await businessOwner.save();
        await customer.save();

        // Log activity after saving for consistency
        await logActivity(businessId, "sendMessageToCustomer", "Message sent successfully");

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
  async updateUserBusiness(businessId, updateCriteria) {
    try {
      // Check if a business for the given userId already exists
      const existingBusiness = await BusinessOwner.findOne({ _id: businessId });
  
      if (existingBusiness) {
        // If a business exists, update the existing document
        const updatedOwner = await BusinessOwner.findOneAndUpdate(
          { _id: businessId },
          updateCriteria,
          { new: true, upsert: true } // Update the existing document
        );
        await logActivity(businessId, "updateUserBusiness", "New user business created successfully");
        return updatedOwner;
      } 
        // If no business exists, create a new document
        const newBusiness = await BusinessOwner.create({
          _id: businessId,
          ...updateCriteria,
        });

        await logActivity(businessId, "updateUserBusiness", "New user business created successfully");

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
    return { numberOfBusinesses, businesses };
  } catch (error) {
    console.error("Error retrieving user businesses:", error);
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
  async uploadImage(businessId, file) {
    try {
      const updateResult = await BusinessOwner.updateOne(
        {
          _id: businessId,
        },
        {
          attachment: file.path,
        }
      );
      await logActivity(businessId, "uploadImage", "Image uploaded successfully");

      return updateResult;
    } catch (error) {
      return error.message;
    }
  },
  async addImageToUserProfile(userId, file ) {
    try {
      const updateResult = await User.updateOne(
        {
           _id: userId
           },
        { 
          userProfile: file.path,  
        }
      );
      await logActivity(userId, "uploadImage", "Image uploaded successfully");

      return updateResult;
    } catch (error) {
      console.error("Error adding image to user profile:", error);
      throw error;
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
  async getBusinessReviews(businessId) {
    try {
      // Find the business owner by ID
      const business = await BusinessOwner.findOne({ _id: businessId });
  
      if (!business) {
        throw new Error("Business not found");
      }
  
      // Get the reviews associated with the business
      const {reviews} = business;
      
      // Count the reviews
      const reviewCount = reviews.length;
  
      // Return an object containing reviews and their count
      return { reviews, reviewCount };
    } catch (error) {
      throw new Error(`Error retrieving reviews for business: ${error.message}`);
    }
  },
  async addLogo(businessId, file) {
    try {
      const updateResult = await BusinessOwner.updateOne(
        {
          _id: businessId,
        },
        {
          logo: file.path,
        }
      );
      await logActivity(businessId, "addLogo", "logo uploaded successfully");

      return updateResult;
    } catch (error) {
      return error.message;
    }
  },

  async updateServiceRequestStatus(serviceRequestId, newStatus, approvalStatus) {
    try {
        // Validate newStatus
        if (!['Pending', 'In Progress', 'Completed'].includes(newStatus)) {
            return { success: false, message: "Invalid status value" };
        }

        // Validate approvalStatus
        if (!['Pending', 'Accepted', 'Declined'].includes(approvalStatus)) {
            return { success: false, message: "Invalid approval status value" };
        }

        // Find the service request by ID
        const serviceRequest = await service.findById(serviceRequestId);

        // Check if the service request exists
        if (!serviceRequest) {
            return { success: false, message: "Service request not found" };
        }

        // Update the approval status
        serviceRequest.approvalStatus = approvalStatus;
        console.log(`New approval status set: ${serviceRequest.approvalStatus}`);

        // If approvalStatus is 'Accepted', then update the status
        if (approvalStatus === 'Accepted') {
            serviceRequest.status = newStatus;
            console.log(`New status set: ${serviceRequest.status}`);
        }

        // Save the updated service request
        await serviceRequest.save();
        console.log(`Service request updated: ${serviceRequest}`);

        return { success: true, message: "Service request status updated successfully" };
    } catch (error) {
        console.error(error);
        return { success: false, message: "Internal Server Error" };
    }
}, 
async listServicesByBusinessId(businessId) {
  try {
    // Find all service requests associated with the specified businessId
    const services = await service.find({
      businessId: businessId,
    }).sort({ createdAt: 1 }); // Sort by createdAt field in ascending order

    // Return the fetched services
    return services;
  } catch (error) {
    console.error(error);
    throw new Error("Error fetching services for the business");
  }
}


};




module.exports = BusinessOwnerService;

