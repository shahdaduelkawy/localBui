const reportReviewModel= require("../models/reportReviewModel");

async function reportReview(reviewId,reporterId,reason,status){
    try{
const report=new reportReviewModel({
    _id:reviewId,
    reporterId,
    reason,
    status});
    await report.save();
    return report;

   
    } catch(error){
        throw new Error(`Error reporting review: ${error.message}`);
    }
}
module.exports = {
    reportReview,
  };