const express = require("express");

const mongoose = require("mongoose");

const router = express.Router();
const reportReviewService = require("../services/reportReviewService");

// Utility function to check if a string is a valid ObjectId
function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}
// user can report a rivew
router.post("/:reviewId/:reporterId", async (req, res) => {
  const {reviewId} = req.params;
  const {reporterId} = req.params;

  try {
    const { reason } = req.body;

    if (!reason) {
      return res
        .status(400)
        .json({ error: "Incomplete data. All fields are required." });
    }

    // Check if reporterId and reviewId are valid ObjectId strings
    if (!isValidObjectId(reviewId) || !isValidObjectId(reporterId)) {
      return res
        .status(400)
        .json({ error: "Invalid reporterId or reviewId format." });
    }

    const result = await reportReviewService.reportReview(
      reviewId,
      reporterId,
      reason
    );

    // Check if the report was created successfully
    if (result.message === "Report already submitted for this review.") {
      return res
        .status(400)
        .json({ error: result.message, existingReport: result.existingReport });
    }

    res
      .status(201)
      .json({ message: result.message, newReport: result.newReport });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});




module.exports = router;
