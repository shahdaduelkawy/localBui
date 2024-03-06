const mongoose = require("mongoose");
const reportReviewSchema = new mongoose.Schema({
     
      reporterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'businessOwner',
        required: true,
      },
      reason: {
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

})
const reportReviewModel = mongoose.model('report', reportReviewSchema);

module.exports = reportReviewModel;