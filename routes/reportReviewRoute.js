const express = require("express");

const router = express.Router();
const reportReviewService = require("../services/reportReviewService");

// Route to report a review
router.post("/:reviewId/:ownerID/:customerId", async (req, res) => {
  const { reviewId, ownerID, customerId } = req.params;
  const { status, reason } = req.body; // Extract reason from request body

  try {
    const result = await reportReviewService.reportReview(
      reviewId,
      ownerID,
      customerId,
      status,
      reason // Pass reason to reportReview service function
    );

    // Check the result and send appropriate response
    if (!result.success) {
      return res.status(400).json({ error: result.message });
    }

    if (result.message === "Report already submitted for this review.") {
      return res.status(400).json({ error: result.message, existingReport: result.existingReport });
    }

    res.status(201).json({ message: result.message, newReport: result.newReport });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
