
const reportReviewModel = require("../models/reportReviewModel");
const Customer = require("../models/customerModel");
const BusinessOwner = require("../models/businessOwnerModel");
const User = require("../models/userModel"); // Import the User model

async function reportReview(reviewId, businessOwnerId, customerId, status, reason) {
    try {
        // Fetch the business owner and customer details
        const businessOwner = await BusinessOwner.findById(businessOwnerId);
       // const customer = await Customer.findById(customerId);
        const customer = await Customer.findOne({ userId: customerId });
        if (!customer) {
            return { success: false, message: "Customer not found" };
        }
        if (!businessOwner) {
            throw new Error(`Business owner with ID ${businessOwnerId} not found.`);
        }

        if (!customer) {
            throw new Error(`Customer with ID ${customerId} not found.`);
        }

        // Fetch the user details to get the customer's name
        const user = await User.findById(customer.userId);

        if (!user) {
            throw new Error(`User with ID ${customer.userId} not found.`);
        }

        // Fetch the review from the businessOwner's reviews array based on reviewId
        let review;
        if (businessOwner) {
            review = businessOwner.reviews.find(review => review._id.equals(reviewId));
        }

        if (!review) {
            throw new Error(`Review with ID ${reviewId} not found.`);
        }

        // Check if a report already exists for the given reviewId and businessOwnerId
        const existingReport = await reportReviewModel.findOne({ reviewId, businessOwnerId });

        if (existingReport) {
            return { message: 'Report already submitted for this review.', existingReport };
        }

        // If no existing report, create a new one
        const newReport = new reportReviewModel({
            reviewId,
            businessOwnerId,
            customerId,
            businessName: businessOwner.businessName,
            customerName: user.name, // Use the name field from the User schema
            review: review.content,
            status,
            reason // Include the reason field
        });

        await newReport.save();
        return { message: 'Report submitted successfully.', newReport };
    } catch (error) {
        throw new Error(`Error reporting review: ${error.message}`);
    }
}

module.exports = {
    reportReview,
};

