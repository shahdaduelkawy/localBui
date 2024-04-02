
const mongoose = require("mongoose");

const reportReviewSchema = new mongoose.Schema({
    businessOwnerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'businessOwner',
        required: true,
    },
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
        required: true,
    },
    reviewId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Review',
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
}, {
    timestamps: true,
});

const reportReviewModel = mongoose.model('report', reportReviewSchema);

module.exports = reportReviewModel;
