const express = require("express");

const router = express.Router();
const reportReviewService = require("../services/reportReviewService");

router.post("/:reviewId/:reporterId", async (req, res) => {
  const reviewId = req.params.reviewId;
  const reporterId = req.params.reporterId;

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

// Utility function to check if a string is a valid ObjectId
function isValidObjectId(id) {
  const mongoose = require("mongoose");
  return mongoose.Types.ObjectId.isValid(id);
}

// Utility function to check if a string is a valid ObjectId
function isValidObjectId(id) {
  const mongoose = require("mongoose");
  return mongoose.Types.ObjectId.isValid(id);
}

module.exports = router;
