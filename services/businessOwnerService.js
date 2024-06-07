/* eslint-disable no-continue */
/* eslint-disable no-shadow */
/* eslint-disable node/no-missing-require */
/* eslint-disable import/no-unresolved */
/* eslint-disable radix */
/* eslint-disable no-useless-catch */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
const mongoose = require('mongoose');
const BusinessOwner = require("../models/businessOwnerModel");
const Customer = require("../models/customerModel");
const Category = require('../models/categorySchema '); 
const User = require("../models/userModel");
const ApiError = require("../utils/apiError");
const service = require("../models/serviceRequestModel");
const { logActivity } = require("./activityLogService");
const sendEmail = require('../utils/sendEmail');

const BusinessOwnerService = {
  async sendMessageToCustomer(businessId, customerId, message) {
    try {
      console.log("sendMessageToCustomer: Starting function...");

      // Check if the business owner exists
      const businessOwner = await BusinessOwner.findById(businessId);
      if (!businessOwner) {
        throw new ApiError(
          `Business owner not found for ID: ${businessId}`,
          404
        );
      }
      console.log("sendMessageToCustomer: Business owner found");

      // Check if the customer exists
      const customer = await Customer.findOne({ userId: customerId });
      if (!customer) {
        throw new ApiError(`Customer not found for ID: ${customerId}`, 404);
      }
      console.log("sendMessageToCustomer: Customer found");

      const user = await User.findById(customer.userId);
      if (!user) {
        console.log("sendMessageToCustomer: User not found");
        return { success: false, message: "User not found" };
      }

      console.log("sendMessageToCustomer: User found");

      // Ensure `messages` arrays exist and are not empty
      businessOwner.messages = Array.isArray(businessOwner.messages)
        ? businessOwner.messages
        : [];
      customer.messages = Array.isArray(customer.messages)
        ? customer.messages
        : [];

      console.log("sendMessageToCustomer: Messages arrays initialized");

      const businessOwnerName = user.name;

      // Create the message objects consistently
      const customerMessage = {
        businessId: businessId,
        customerId: customerId,
        sender: "businessOwner",
        content: message,
        userName: businessOwnerName,
        timestamp: new Date(),
      };

      const businessOwnerMessage = {
        businessId: businessId,
        customerId: customerId,
        sender: "businessOwner", // Corrected sender field
        content: message,
        timestamp: new Date(),
        userName: businessOwnerName,
      };

      // Push messages into the arrays
      customer.messages.push(customerMessage);
      businessOwner.messages.push(businessOwnerMessage);

      console.log("sendMessageToCustomer: Messages pushed into arrays");

      // Ensure data is saved to the database
      await customer.save();
      await businessOwner.save();

      console.log("sendMessageToCustomer: Data saved successfully");

      // Log activity after saving for consistency
      await logActivity(
        businessId,
        "sendMessageToCustomer",
        "Message sent successfully"
      );

      console.log("sendMessageToCustomer: Activity logged");

      // Return the updated messages and status
      return {
        success: true,
        message: "Message sent successfully",
        businessOwnerMessages: businessOwner.messages,
        businessId: businessId,
        customerId: customerId,
        customerMessages: customer.messages,
        messageContent: message,
      };
    } catch (error) {
      console.error(`Error sending message: ${error.message}`);
      throw new ApiError(error.message, error.statusCode || 500); // Throw the error with its message
    }
  },
  async getCustomerMessages (businessId) {
    try {
      const results = await BusinessOwner.aggregate([
        { $match: { _id: new mongoose.Types.ObjectId(businessId) } },
        { $unwind: "$messages" },
        { $match: { "messages.businessId": new mongoose.Types.ObjectId(businessId) } },
        { $sort: { "messages.timestamp": -1 } },
        {
          $group: {
            _id: "$messages.customerId",
            lastMessage: { $first: "$messages" }
          }
        },
        {
          $project: {
            _id: 0,
            customerId: "$_id",
            lastMessage: {
              content: "$lastMessage.content",
              timestamp: "$lastMessage.timestamp",
              sender: "$lastMessage.sender",
              userName: "$lastMessage.userName"
            }
          }
        }
      ]);
  
      return results;
    } catch (error) {
      console.error("Error in getCustomerMessages:", error);
      throw new Error("Error retrieving customers and their last message.");
    }
  },
  async getUserByUserID(userId) {
    try {
      // Find the user based on the user's ID
      const user = await User.findOne({ _id: userId });

      if (!user) {
        throw new ApiError("User not found for the given userId", 404);
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
      await logActivity(
        businessId,
        "uploadedmedia",
        "Media uploaded successfully"
      );

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
        { new: true, upsert: true } // Return the modified document
      );

      if (!profileSetup) {
        // If profileSetup is null, the business with the given ID was not found
        console.error("Business not found with ID:", businessId);
        return null;
      }

      await logActivity(
        businessId,
        "profileSetup",
        "Profile setup completed successfully"
      );

      return profileSetup;
    } catch (error) {
      console.error("Error updating user business:", error);
      return null;
    }
  },
  async addMultipleBusinesses(ownerID, businessesData) {
    try {
        const businessesArray = Array.isArray(businessesData) ? businessesData : [businessesData];
        const createdBusinesses = [];

        for (const businessData of businessesArray) {
            if (typeof businessData.category !== 'string') {
                console.error(`Skipping addition of business. Invalid category format: ${JSON.stringify(businessData)}`);
                continue;
            }

            // Check if the category is valid
            const existingCategory = await Category.findOne({ name: businessData.category });
            if (!existingCategory) {
                console.error(`Skipping addition of business. Invalid category: ${businessData.category}`);
                continue;
            }

            // Use the category name directly
            const newBusiness = await BusinessOwner.create({
                userId: ownerID,
                category: businessData.category, // Use category name directly
                ...businessData,
            });

            createdBusinesses.push(newBusiness);
        }

        if (createdBusinesses.length === 0) {
            console.error("No valid businesses were added.");
            return null;
        }

        await logActivity(
            ownerID,
            "addMultipleBusinesses",
            "Multiple businesses added successfully"
        );

        return createdBusinesses;
    } catch (error) {
        console.error("Error adding businesses:", error);
        return null;
    }
  },
  async updateUserBusiness(businessId, updateCriteria) {
    try {
        const updateCategory = updateCriteria.category;
        const existingBusiness = await BusinessOwner.findOne({ _id: businessId });

        if (!existingBusiness) {
            throw new Error("Business not found.");
        }

        // Check if the category is valid
        if (updateCategory) {
            const existingCategory = await Category.findOne({ name: updateCategory });
            if (!existingCategory) {
                throw new Error(`Invalid category: ${updateCategory}`);
            }

            // Update category name directly
            existingBusiness.category = updateCategory;
        }

        // Update other fields
        Object.assign(existingBusiness, updateCriteria);

        const updatedOwner = await existingBusiness.save();

        await logActivity(
            businessId,
            "updateUserBusiness",
            "User business updated successfully"
        );

        return updatedOwner;
    } catch (error) {
        console.error("Error updating user business:", error);
        throw new Error(error.message);
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
      await logActivity(
        businessId,
        "uploadImage",
        "Image uploaded successfully"
      );

      return updateResult;
    } catch (error) {
      return error.message;
    }
  },
  async addImageToUserProfile(userId, file) {
    try {
      const updateResult = await User.updateOne(
        {
          _id: userId,
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
      const { reviews } = business;

      // Count the reviews
      const reviewCount = reviews.length;

      // Return an object containing reviews and their count
      return { reviews, reviewCount };
    } catch (error) {
      throw new Error(
        `Error retrieving reviews for business: ${error.message}`
      );
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
  async listServicesByBusinessId(businessId) {
    try {
      const services = await service
        .find({
          businessId: businessId,
        })
        .sort({ createdAt: 1 });

      // Filter services based on the specified criteria
      const filteredServices = services.filter(
        (service) =>
          (service.status === "In Progress" &&
            service.approvalStatus === "Accepted") ||
          (service.status === "Pending" && service.approvalStatus === "Pending")
      );

      // Sort the filtered services
      const sortedServices = filteredServices.sort((a, b) => {
        const getStatusOrder = (service) => {
          if (
            service.status === "In Progress" &&
            service.approvalStatus === "Accepted"
          )
            return 1;
          if (
            service.status === "Pending" &&
            service.approvalStatus === "Pending"
          )
            return 2;
          return 3;
        };

        const orderA = getStatusOrder(a);
        const orderB = getStatusOrder(b);

        if (orderA !== orderB) {
          return orderA - orderB;
        }
        return new Date(a.createdAt) - new Date(b.createdAt);
      });

      return sortedServices;
    } catch (error) {
      console.error(error);
      throw new Error("Error fetching services for the business");
    }
  },
  async getTotalRate(businessId) {
    try {
      // Find the business by ID
      const business = await BusinessOwner.findById(businessId);

      if (!business) {
        return { status: "fail", message: "Business not found" };
      }

      // Filter out reviews with undefined starRating
      const ratedReviews = business.reviews.filter(
        (review) => typeof review.starRating !== "undefined"
      );

      // Calculate the average rating
      const totalRatings = ratedReviews.length;

      if (totalRatings === 0) {
        // Set totalRate to 0 if there are no reviews
        business.totalRate = 0;
      } else {
        const totalRating = ratedReviews.reduce(
          (sum, review) => sum + review.starRating,
          0
        );

        const averageRating = totalRating / totalRatings;

        // Set totalRate to the average rating
        business.totalRate = averageRating;
      }

      // Save the updated business document
      await business.save();

      // Return success response
      return {
        status: "success",
        message: "Total rate updated successfully",
        totalRate: business.totalRate,
      };
    } catch (error) {
      console.error(error);
      return { status: "error", error: "Internal Server Error" };
    }
  },
  async handleBusinessExpiration() {
    try {
      // Get the current date
      const currentDate = new Date();

      // Find businesses with expirationDate less than or equal to the current date
      const expiredBusinesses = await BusinessOwner.find({
        expirationDate: { $lte: currentDate },
      });

      return {
        status: "success",
        expiredBusinesses: expiredBusinesses,
      };
    } catch (error) {
      console.error("Error handling business expiration:", error);
    }
  },
  async getAllUserBusinesses(ownerID) {
    try {
      const businesses = await BusinessOwner.find({ userId: ownerID });
      const numberOfBusinesses = await BusinessOwner.countDocuments({
        userId: ownerID,
      });

      // Sort the businesses based on status
      const sortedBusinesses = businesses.sort((a, b) => {
        if (a.status === "accepted") return -1;
        if (b.status === "accepted") return 1;
        if (a.status === "pending") return -1;
        if (b.status === "pending") return 1;
        if (a.status === "rejected") return -1;
        if (b.status === "rejected") return 1;
        return 0;
      });

      return { numberOfBusinesses, businesses: sortedBusinesses };
    } catch (error) {
      console.error("Error retrieving user businesses:", error);
      return null;
    }
  },
  async updateServiceRequestStatus  (
    serviceRequestId,
    newStatus,
    approvalStatus
  ){
    try {
      if (!["Pending", "In Progress", "Completed"].includes(newStatus)) {
        return { success: false, message: "Invalid status value" };
      }
  
      if (!["Pending", "Accepted", "Declined"].includes(approvalStatus)) {
        return { success: false, message: "Invalid approval status value" };
      }
  
      const serviceRequest = await service.findById(serviceRequestId);
  
      if (!serviceRequest) {
        return { success: false, message: "Service request not found" };
      }
  
      // Find the business owner associated with the businessId
      const businessOwner = await BusinessOwner.findById(serviceRequest.businessId);
      if (!businessOwner) {
        console.error(`Business owner with ID ${serviceRequest.businessId} not found`);
        return { success: false, message: 'Business owner not found' };
      }
  
      // Find the user associated with the customerId
      const customer = await User.findById(serviceRequest.customerId);
      if (!customer) {
        console.error(`Customer with ID ${serviceRequest.customerId} not found`);
        return { success: false, message: 'Customer not found' };
      }
  
      serviceRequest.approvalStatus = approvalStatus;
      console.log(`New approval status set: ${serviceRequest.approvalStatus}`);
  
      if (approvalStatus === "Accepted") {
        serviceRequest.status = newStatus;
        console.log(`New status set: ${serviceRequest.status}`);
  
        await sendEmail({
          email: customer.email,
          subject: 'Service Request Accepted',
          message: `Hello ${customer.name},\n\nYour service request to ${businessOwner.businessName} is now in progress. You can chat with the business now.`
        });
      } else if (approvalStatus === "Declined") {
        await sendEmail({
          email: customer.email,
          subject: 'Service Request Declined',
          message: `Hello ${customer.name},\n\nSorry, your service request to ${businessOwner.businessName} has been declined.`
        });
      }
  
      await serviceRequest.save();
      console.log(`Service request updated: ${serviceRequest}`);
  
      return {
        success: true,
        message: "Service request status updated successfully",
      };
    } catch (error) {
      console.error(error);
      return { success: false, message: "Internal Server Error" };
    }
  },
  
};
module.exports = BusinessOwnerService;
