/* eslint-disable new-cap */
/* eslint-disable no-shadow */
const mongoose = require('mongoose'); // Ensure mongoose is required
const reportReviewModel = require("../models/reportReviewModel");
const Customer = require("../models/customerModel");
const BusinessOwner = require("../models/businessOwnerModel");
const User = require("../models/userModel"); // Import the User model

async function reportReview(reviewId, ownerID, customerId, status, reason) {
    try {
        console.log(`Fetching business owner with ID: ${ownerID}`);
        const businessOwner = await BusinessOwner.findOne({ userId: ownerID });

        if (!businessOwner) {
            console.error(`Business owner with ID ${ownerID} not found.`);
            return { success: false, message: `Business owner with ID ${ownerID} not found.` };
        }

        console.log(`Fetching customer with user ID: ${customerId}`);
        const customer = await Customer.findOne({ userId: customerId });
        
        if (!customer) {
            console.error(`Customer with user ID ${customerId} not found.`);
            return { success: false, message: "Customer not found" };
        }

        console.log(`Fetching user with ID: ${customer.userId}`);
        const user = await User.findById(customer.userId);
        
        if (!user) {
            console.error(`User with ID ${customer.userId} not found.`);
            return { success: false, message: `User with ID ${customer.userId} not found.` };
        }

        console.log(`Business owner reviews: ${JSON.stringify(businessOwner.reviews)}`);

        // Convert reviewId to ObjectId for comparison
        const reviewObjectId = new mongoose.Types.ObjectId(reviewId);

        // Fetch the review from the business owner's reviews array based on reviewId
        const review = businessOwner.reviews.find(review => review._id.equals(reviewObjectId));
        
        if (!review) {
            console.error(`Review with ID ${reviewId} not found.`);
            return { success: false, message: `Review with ID ${reviewId} not found.` };
        }

        // Check if a report already exists for the given reviewId and ownerID
        const existingReport = await reportReviewModel.findOne({ reviewId, ownerID });

        if (existingReport) {
            return { message: 'Report already submitted for this review.', existingReport };
        }

        // If no existing report, create a new one
        const newReport = new reportReviewModel({
            reviewId,
            ownerID,
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
        console.error(`Error reporting review: ${error.message}`);
        return { success: false, message: `Error reporting review: ${error.message}` };
    }
}

module.exports = {
    reportReview,
};
