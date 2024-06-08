
const mongoose = require("mongoose");

const reportReviewSchema = new mongoose.Schema({
    reviewId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Review',
        required: true,
    },
    ownerID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'BusinessOwner',
        required: true,
    },
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
        required: true,
    },
    businessId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "BusinessOwner", // Correct the reference model
        required: true,
    },
    businessName: {
        type: String,
        required: false,
    },
    customerName: {
        type: String,
        required: false,
    },
    review: {
        type: String,
        required: false,
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending',
    },
    reason: {
        type: String,
        required: false,
    },
}, {
    timestamps: true,
});


const ReportReview = mongoose.model('ReportReview', reportReviewSchema);

module.exports = ReportReview;
