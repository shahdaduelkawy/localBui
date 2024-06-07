const mongoose = require('mongoose');

const serviceRequestSchema = new mongoose.Schema({
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true
    },
    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BusinessOwner',
      required: true
    },
    requestDetails: {
      type: String,
      required: true
    },
    name: String, 
    phone: String, 
    
    coordinates: {
      type: [Number], 
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
