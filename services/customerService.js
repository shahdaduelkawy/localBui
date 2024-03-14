const Customer = require("../models/customerModel");
const { logActivity } = require("./activityLogService");
const BusinessOwner = require("../models/businessOwnerModel");
const ApiError = require("../utils/apiError");
const User = require("../models/userModel");

const CustomerService = {
  async sendMessageToBusinessOwner(customerId, businessId, message) {
    try {
        // Check if the customer exists
        const customer = await Customer.findOne({ userId: customerId });
        if (!customer) {
            throw new ApiError(`Customer not found for ID: ${customerId}`, 404);
        }

        // Check if the business owner exists
        const businessOwner = await BusinessOwner.findById(businessId); // Remove curly braces
        if (!businessOwner) {
            throw new ApiError(`Business owner not found for ID: ${businessId}`, 404);
        }

        const user = await User.findById(customer.userId);
        if (!user) {
            return { success: false, message: "User not found" };
        }

        // Ensure `messages` arrays exist and are not empty
        customer.messages = Array.isArray(customer.messages) ? customer.messages : [];
        businessOwner.messages = Array.isArray(businessOwner.messages) ? businessOwner.messages : [];

        const customerName = user.name;

        // Create the message objects consistently
        const customerMessage = {
            sender: "customer",
            content: message,
            userName: customerName,
            timestamp: new Date(),
        };

        const businessOwnerMessage = {
            sender: "customer",
            content: message, // Ensure content is set correctly
            timestamp: new Date(),
            userName: customerName,
        };

        // Push messages into the arrays
        customer.messages.push(customerMessage);
        businessOwner.messages.push(businessOwnerMessage);

        // Ensure data is saved to the database
        await customer.save();
        await businessOwner.save();

        // Log activity after saving for consistency
        await logActivity(customerId, "sendMessageToBusinessOwner", "Message sent successfully");

        // Return the updated messages and status
        return {
            success: true,
            message: "Message sent successfully",
            customerMessages: customer.messages,
            businessOwnerMessages: businessOwner.messages,
        };
    } catch (error) {
        console.error(`Error sending message: ${error.message}`);
        throw new ApiError("Error sending message", error.statusCode || 500);
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
  //customer can write a review to businessowner

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
};
async function rateBusiness(customerId, businessId, starRating) {
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
}

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

module.exports = {
  searchBusinessesByName,
  CustomerService,
  filterbycategory,
  rateBusiness,
};
