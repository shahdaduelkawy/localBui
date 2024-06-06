const asyncHandler = require('express-async-handler');
const factory = require("./handlersFactory");
const sendEmail = require('../utils/sendEmail');
const Category = require('../models/categorySchema '); 
const User = require("../models/userModel");
const businessOwner = require("../models/businessOwnerModel");
const reportReviewModel = require("../models/reportReviewModel");
const ApiError = require('../utils/apiError');

exports.createAdmin = factory.createOne(User);
exports.deleteUsers = factory.deleteOne(User);
exports.deleteBusiness = factory.deleteOne(businessOwner);
exports.getreports = factory.getAll(reportReviewModel);
exports.deleteReview = factory.deleteOne(reportReviewModel)
exports.searchUserByName = asyncHandler(async (req, res, next) => {
    const { name } = req.params;
  
    // If name is not provided, set it to an empty string to retrieve all users
    const regex = new RegExp(name || '', 'i');
  
    // Search for users with names matching the provided term
    const users = await User.find({ name: regex });
  
    // Check if users were found
    if (users.length === 0) {
      return next(new ApiError(`No users found for the given search term ${name}`, 404));
    }
  
    // Return the number of users found along with the list of users
    res.status(200).json({ success: true, count: users.length, users });
  });

  exports.searchReviewsByContent = asyncHandler(async (req, res, next) => {
    const { content } = req.query;
  
    try {
      // If content is not provided, return an error
      if (!content) {
        return next(new ApiError("Content is required for searching reviews", 400));
      }
  
      // Construct a case-insensitive regex pattern to match the entire search term anywhere in the content
      const regex = new RegExp(content, "i");
  
      // Search for reviews with content matching the provided term
      const businesses = await businessOwner.find({ "reviews.content": regex }, { "reviews": 1, "userName": 1 });
  
      // Check if reviews were found
      if (businesses.length === 0) {
        return res.status(404).json({ success: false, message: `No reviews found for the given content: ${content}` });
      }
  
      // Extract the necessary information (review content and user name)
      const filteredReviews = businesses.map((business) => ({
        userName: business.userName,
        reviews: business.reviews.filter((review) => regex.test(review.content))
      }));
  
      res.status(200).json({ success: true, count: filteredReviews.length, reviews: filteredReviews });
    } catch (error) {
      console.error("Error searching reviews by content:", error);
      res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});
exports.searchbusinessByName = asyncHandler(async (req, res, next) => {
  const { businessName } = req.params;

  // If businessName is not provided, set it to an empty string to retrieve all businesses
  const regex = new RegExp(businessName || '', 'i');

  // Search for businesses with names matching the provided term
  const businesses= await businessOwner.find({ businessName: regex });

  // Check if businesses were found
  if (businesses.length === 0) {
    return next(new ApiError(`No businesses found for the given search term ${businessName}`, 404));
  }

  // Return the number of businesses found along with the list of businesses
  res.status(200).json({ success: true, count: businesses.length, businesses });
});
exports.getRequests = asyncHandler(async (req, res, next) => {
  try {
    // Fetch all businesses
    const businesses = await businessOwner.find();

    // Arrange businesses by status: pending first, then rejected, then accepted
    const sortedBusinesses = businesses.sort((a, b) => {
      const statusOrder = { pending: 1, rejected: 2, accepted: 3 };
      return statusOrder[a.status] - statusOrder[b.status];
    });

    // Return the sorted businesses
    res.status(200).json({ success: true, count: sortedBusinesses.length, businesses: sortedBusinesses });
  } catch (error) {
    console.error("Error fetching businesses:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});
exports.getbusinesses = asyncHandler(async (req, res, next) => {
  try {
    // Fetch all businesses
    const businesses = await businessOwner.find();

    // Filter businesses to include only those with the "accepted" status
    const acceptedBusinesses = businesses.filter(business => business.status === "accepted");

    // Return the accepted businesses
    res.status(200).json({ success: true, count: acceptedBusinesses.length, businesses: acceptedBusinesses });
  } catch (error) {
    console.error("Error fetching businesses:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});
exports.updateBusinessOwnerStatus = asyncHandler(async (businessId, newStatus, rejectionReason) => {
    try {
        // Find the business owner document by ID
        const BusinessOwner = await businessOwner.findById(businessId);

        if (!BusinessOwner) {
            throw new Error('Business owner not found');
        }

        // Update the status
        BusinessOwner.status = newStatus;

        // Save the updated document
        await BusinessOwner.save();

        if (newStatus === 'rejected') {
            // If status is rejected, send rejection email
            const user = await User.findById(BusinessOwner.userId); // Assuming BusinessOwner has userId field
            if (!user) {
                throw new Error('User not found');
            }

            const rejectionMessage = `Your business has been rejected because: ${rejectionReason}`;
            await sendEmail({
                email: user.email,
                subject: 'Business Rejection Notification',
                message: rejectionMessage,
            });
        }

        return BusinessOwner; // Return the updated business owner document
    } catch (error) {
        throw new Error(`Failed to update business owner status: ${error.message}`);
    }
});
exports.addCategory = async (categoryName) => {
  try {
    // Check if the category already exists
    let category = await Category.findOne({ name: categoryName });

    if (!category) {
      // If not, create a new category
      category = new Category({ name: categoryName });
      await category.save();
    }

    // Return the updated list of categories
    const categories = await Category.find();
    return categories.map(cat => cat.name);
  } catch (error) {
    throw new Error(`Failed to add category: ${error.message}`);
  }
};
exports.deleteCategory = async (categoryId) => {
  try {
    // Delete the category from the Category collection by ID
    const deletedCategory = await Category.findByIdAndDelete(categoryId);

    if (!deletedCategory) {
      throw new Error(`Category with ID ${categoryId} not found.`);
    }

    // Return success message
    return { success: true, message: `Category "${deletedCategory.name}" deleted successfully` };
  } catch (error) {
    throw new Error(`Failed to delete category: ${error.message}`);
  }
};
exports.listCategories = async () => {
  try {
    // Find all categories from the Category collection
    const allCategories = await Category.find({}, 'name image');

    // Return the list of categories with only the name and image fields
    return allCategories;
  } catch (error) {
    throw new Error(`Failed to list categories: ${error.message}`);
  }
};
exports.uploadCategoryImage = async (categoryId, imagePath) => {
  try {
    const category = await Category.findByIdAndUpdate(
      categoryId,
      { image: imagePath },
      { new: true }
    );

    if (!category) {
      throw new Error(`Category with ID ${categoryId} not found.`);
    }

    return category;
  } catch (error) {
    throw new Error(`Failed to upload category image: ${error.message}`);
  }
};
exports.uploadIconeImage = async (categoryId, iconePath) => {
  try {
    const category = await Category.findByIdAndUpdate(
      categoryId,
      { icone: iconePath },
      { new: true }
    );

    if (!category) {
      throw new Error(`Category with ID ${categoryId} not found.`);
    }

    return category;
  } catch (error) {
    throw new Error(`Failed to upload category icone: ${error.message}`);
  }
};