
const mongoose = require("mongoose");

const reportReviewSchema = new mongoose.Schema({
    reviewId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Review',
        required: true,
    },
    businessOwnerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'BusinessOwner',
        required: true,
    },
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
        required: true,
    },
    businessName: {
        type: String,
        required: true,
    },
    customerName: {
        type: String,
        required: true,
    },
    review: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending',
    },
    reason: { // Add the reason field
        type: String,
        required: true,
    },
}, {
    timestamps: true,
});

const ReportReview = mongoose.model('ReportReview', reportReviewSchema);

module.exports = ReportReview;
