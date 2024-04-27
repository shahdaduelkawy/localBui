const mongoose = require("mongoose");

const Customer = require("../models/customerModel");
const { logActivity } = require("./activityLogService");
const BusinessOwner = require("../models/businessOwnerModel");
const ApiError = require("../utils/apiError");
const User = require("../models/userModel");
const ServiceRequest = require("../models/serviceRequestModel");

const CustomerService = {
  async recommendBusinessesToCustomer(customerId) {
    try {
        // Find the customer by ID
        const customer = await Customer.findOne({ userId: customerId });

        if (!customer) {
            throw new ApiError('Customer not found', 404);
        }

        // Get the customer's favorite businesses
        const favoriteBusinessIds = customer.favoriteBusinesses.map(business => business.businessId);

        // Get the customer's past reviews
        const reviewedBusinessIds = customer.reviews.map(review => review.businessId);

        // Combine favorite businesses and reviewed businesses to avoid recommending the same ones
        const excludedBusinessIds = [...favoriteBusinessIds, ...reviewedBusinessIds];

        // Initialize array to store recommended businesses
        let recommendedBusinesses = [];

        // If the customer has interacted with businesses before (favorited or reviewed)
        if (excludedBusinessIds.length > 0) {
            // Find all businesses that the customer has interacted with before
            const interactedBusinesses = await BusinessOwner.find({ _id: { $in: excludedBusinessIds } });

            // Extract categories of the interacted businesses
            const interactedCategories = interactedBusinesses.map(business => business.category);

            // Find businesses that belong to the same categories as the ones the customer has interacted with
            recommendedBusinesses = await BusinessOwner.find({ 
                _id: { $nin: excludedBusinessIds }, // Exclude businesses already interacted with
                category: { $in: interactedCategories } // Filter by categories of interacted businesses
            }).sort({ rating: -1 }).limit(12); // Sort by rating in descending order and limit to 5 businesses
        } else {
            // If the customer hasn't interacted with any businesses before, recommend all businesses sorted by rating
            recommendedBusinesses = await BusinessOwner.find().sort({ rating: -1 }).limit(10); // Sort by rating in descending order and limit to 5 businesses
        }

        // Format the recommended businesses data
        const formattedRecommendedBusinesses = recommendedBusinesses.map(business => ({
            businessId: business._id,
            businessName: business.businessName,
            country: business.Country,
            category: business.category,
            totalRate: business.totalRate,
            logo: business.logo, // Include the logo
        }));

        return formattedRecommendedBusinesses;
    } catch (error) {
        console.error(`Error recommending businesses: ${error.message}`);
        throw new ApiError("Error recommending businesses", error.statusCode || 500);
    }
  },
  async uploadCustomerImage(customerId, file) {
    try {
      const updateResult = await Customer.updateOne(
        { userId: customerId },
        { profileImg: file.path }
      );

      await logActivity(
        customerId,
        "uploadImage",
        "Image uploaded successfully"
      );

      return updateResult;
    } catch (error) {
      return error.message;
    }
  },
  async writeReview(customerId, businessId, review) {
    try {
      const customer = await Customer.findOne({ userId: customerId });
      if (!customer) {
        return { success: false, message: "Customer not found" };
      }

      const business = await BusinessOwner.findById(businessId);
      if (!business) {
        return { success: false, message: "Business not found" };
      }
      const user = await User.findById(customer.userId);
      if (!user) {
        return { success: false, message: "User not found" };
      }

      const customerName = user.name;

      // Check if 'reviews' array exists in customer and business objects
      if (!customer.reviews) {
        customer.reviews = [];
      }
      if (!business.reviews) {
        business.reviews = [];
      }

      customer.reviews.push({
        businessId: businessId,
        content: review,
        timestamp: new Date(),
        userName: customerName,
      });

      await customer.save();

      business.reviews.push({
        customerId: customerId,
        content: review,
        timestamp: new Date(),
        userName: customerName,
      });

      await business.save();

      await logActivity(
        customerId,
        "writeReview",
        `Wrote a review for ${business.businessName}`
      );

      return { success: true, message: "Review added successfully" };
    } catch (error) {
      console.error(error);
      return { success: false, message: "Internal Server Error" };
    }
  },
  async getBusinessById(businessId) {
    try {
      const business = await BusinessOwner.findById(businessId);
      if (!business) {
        throw new ApiError("Business not found for the given businessId", 404);
      }
    

      return business; 
    } catch (error) {
      console.error("Error retrieving business:", error);
      throw new ApiError("Internal Server Error", 500);
    }
  },
  async pincustomerOnMap(customerId, coordinates) {
    try {
      const customer = await Customer.findOne({ userId: customerId });

      if (!customer) {
        throw new Error("customer not found");
      }

      customer.customer = {
        type: "Point",
        coordinates: coordinates,
      };

      await customer.save();

      console.log("customer location pinned successfully");
    } catch (error) {
      console.error(
        `Error pinning customer on map  ${customerId}: ${error.message}`
      );
    }
  },
  async rateBusiness(customerId, businessId, starRating) {
    try {
      if (starRating < 1 || starRating > 5) {
        throw new Error("Star rating must be between 1 and 5.");
      }

      const customer = await Customer.findOne({ userId: customerId });

      if (!customer) {
        return { success: false, message: "Customer not found" };
      }

      // Check if the provided businessId exists
      const business = await BusinessOwner.findById(businessId);

      if (!business) {
        return { success: false, message: "Business not found" };
      }

      // Update or add the review
      const existingReviewIndex = customer.reviews.findIndex(
        (review) => review.businessId.toString() === businessId
      );

      if (existingReviewIndex !== -1) {
        // If the customer already reviewed this business, update the star rating
        customer.reviews[existingReviewIndex].starRating = starRating;
      } else {
        // If the customer hasn't reviewed this business, add a new review
        customer.reviews.push({
          businessId,
          starRating,
          timestamp: new Date(),
        });
      }

      // Save the updated customer document
      await customer.save();

      // Update or add the starRating in the businessOwnerModel
      const existingBusinessReviewIndex = business.reviews.findIndex(
        (review) => review.customerId.toString() === customer._id.toString()
      );

      if (existingBusinessReviewIndex !== -1) {
        // If the customer already reviewed this business, update the star rating
        business.reviews[existingBusinessReviewIndex].starRating = starRating;
      } else {
        // If the customer hasn't reviewed this business, add a new review
        business.reviews.push({
          customerId: customer._id,
          starRating,
          timestamp: new Date(),
        });
      }

      // Save the updated businessOwnerModel document
      await business.save();

      return {
        status: "success",
        message: "Business rated successfully.",
      };
    } catch (error) {
      return {
        status: "error",
        message: error.message,
      };
    }
  },
  async createServiceRequest(
    customerId,
    businessId,
    requestDetails,
  ) {
    try {
      // Check if the customer exists
      const customer = await Customer.findOne({ userId: customerId });
      if (!customer) {
        return { success: false, message: "Customer not found" };
      }
  
      // Fetch user details to get name and phone
      const user = await User.findById(customerId);
      if (!user) {
        return { success: false, message: "User not found" };
      }
  
      // Extract name and phone from user
      const { name, phone } = user;
  
      // Extract coordinates from the customer object
      const { coordinates } = customer.customer;
  
      // Check if the business owner exists
      const businessOwner = await BusinessOwner.findById(businessId);
      if (!businessOwner) {
        throw new ApiError(
          `Business owner not found for ID: ${businessId}`,
          404
        );
      }
  
      // Check if a service request already exists with the given details
      const existingRequest = await ServiceRequest.findOne({
        customerId,
        businessId,
        requestDetails,
        name,
        phone,
        coordinates,
      });
  
      if (existingRequest) {
        return { message: "Service request already exists.", existingRequest };
      }
  
      // If no existing request, create a new one
      const newServiceRequest = new ServiceRequest({
        customerId,
        businessId,
        requestDetails,
        name,
        phone,
        coordinates,
      });
  
      await newServiceRequest.save();
      return {
        message: "Service request submitted successfully.",
        newServiceRequest,
      };
    } catch (error) {
      if (error instanceof mongoose.Error.CastError) {
        // Handle invalid ObjectId error
        return { success: false, message: "Invalid ID provided" };
      }
      // Handle other errors
      throw new Error(`Error creating service request: ${error.message}`);
    }
  },


};
const filterbycategory = async (req, res) => {
  try {
    let { category } = req.params;

    // If category is not provided, set it to an empty string to retrieve all businesses
    category = category || "";

    // Use a case-insensitive regex for the search
    const regex = new RegExp(category, "i");

    // Search for businesses with names matching the provided term
    const businesses = await BusinessOwner.find(
      category ? { category: regex } : {} // Return all businesses when no specific category is provided
    );

    // Check if businesses were found
    if (businesses.length === 0) {
      return res.status(404).json({
        status: "fail",
        message: "No businesses found for the given search term",
      });
    }

    // Return the number of businesses found along with the list of businesses
    return res
      .status(200)
      .json({ status: "success", count: businesses.length, businesses });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ status: "error", error: "Internal Server Error" });
  }
};
const searchBusinessesByName = async (req, res) => {
  try {
    let { businessName } = req.params;

    // If businessName is not provided, set it to an empty string to retrieve all businesses
    businessName = businessName || "";

    // Use a case-insensitive regex for the search
    const regex = new RegExp(businessName, "i");

    // Search for businesses with names matching the provided term
    const businesses = await BusinessOwner.find(
      businessName ? { businessName: regex } : {} // Return all businesses when no specific businessName is provided
    );

    // Check if businesses were found
    if (businesses.length === 0) {
      return res.status(404).json({
        status: "fail",
        message: "No businesses found for the given search term",
      });
    }

    // Return the number of businesses found along with the list of businesses
    return res
      .status(200)
      .json({ status: "success", count: businesses.length, businesses });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ status: "error", error: "Internal Server Error" });
  }
};
const countCustomerRatings = async (businessId) => {
  try {
    // Find the business owner document by ID
    const business = await BusinessOwner.findById(businessId);

    if (!business) {
      throw new ApiError("Business owner not found", 404);
    }

    // Initialize counters for each star rating
    let oneStarCount = 0;
    let twoStarCount = 0;
    let threeStarCount = 0;
    let fourStarCount = 0;
    let fiveStarCount = 0;
    let unratedCount = 0;

    // Iterate through the reviews array and count occurrences of each star rating
    business.reviews.forEach((review) => {
      switch (review.starRating) {
        case 1:
          oneStarCount += 1;
          break;
        case 2:
          twoStarCount += 1;
          break;
        case 3:
          threeStarCount += 1;
          break;
        case 4:
          fourStarCount += 1;
          break;
        case 5:
          fiveStarCount += 1;
          break;
        default:
          unratedCount += 1;
          break;
      }
    });

    // Return an object containing counts for each star rating
    return {
      oneStarCount,
      twoStarCount,
      threeStarCount,
      fourStarCount,
      fiveStarCount,
      unratedCount,
    };
  } catch (error) {
    throw new ApiError(
      `Failed to count customer ratings: ${error.message}`,
      error.statusCode || 500
    );
  }
};
const isBusinessAlreadyFavorite = async (customerId, businessId) => {
  try {
    // Check if the customer exists
    const customer = await Customer.findOne({ userId: customerId });
    if (!customer) {
      return { success: false, message: "Customer not found" };
    }

    // Check if the business is already a favorite
    const isFavorite = customer.favoriteBusinesses.some((business) =>
      business.businessId.equals(businessId)
    );
    return isFavorite;
  } catch (error) {
    console.error(error);
    return { success: false, message: "Internal Server Error" };
  }
};

module.exports = {
  isBusinessAlreadyFavorite,
  searchBusinessesByName,
  CustomerService,
  filterbycategory,
  countCustomerRatings,
};
