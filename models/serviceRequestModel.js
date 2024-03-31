const mongoose = require('mongoose');

const serviceRequestSchema = new mongoose.Schema({
    customerId: {
      type:  mongoose.Schema.Types.ObjectId,
        ref: "Customer",
        required: true
    },
    businessOwnerId: {
      type:  mongoose.Schema.Types.ObjectId,
         ref: 'businessOwner',
        required: true

    },
    requestDetails: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'In Progress', 'Completed'],
        default: 'Pending'
    },
    approvalStatus: {
        type: String,
        enum: ['Pending', 'Accepted', 'Declined'],
        default: 'Pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('ServiceRequest', serviceRequestSchema);
