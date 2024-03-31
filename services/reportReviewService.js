/* eslint-disable new-cap */
const reportReviewModel= require("../models/reportReviewModel");


async function reportReview(reviewId, reporterId, reason, status) {
    try {
      // Check if a report already exists for the given reviewId and reporterId
      const existingReport = await reportReviewModel.findOne({ _id: reviewId, reporterId });
  
      if (existingReport) {
        return { message: 'Report already submitted for this review.', existingReport };
      }
  
      // If no existing report, create a new one
      const newReport = new reportReviewModel({
        _id: reviewId,
        reporterId,
        reason,
        status,
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