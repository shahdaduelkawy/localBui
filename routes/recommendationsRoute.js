const express = require("express");
const BusinessOwner = require("../models/businessOwnerModel");

const router = express.Router();
const recommendationService = require("../services/recommendationsService");

// Route to get recommendations for a customer
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    // Prepare the data
    const { trainData } = await recommendationService.prepareData();

    // Get the number of unique users and items
    const uniqueUserIds = new Set(
      trainData.map((interaction) => interaction.userId)
    );
    const uniqueItemIds = new Set(
      trainData.map((interaction) => interaction.itemId)
    );
    const numUsers = uniqueUserIds.size;
    const numItems = uniqueItemIds.size;

    // Hyperparameters
    const embeddingDim = 50;
    const epochs = 10;

    // Train the model
    const { model } = await recommendationService.trainModel(
      trainData,
      numUsers,
      numItems,
      embeddingDim,
      epochs
    );

    // Make recommendations for the user
    const businessOwners = await BusinessOwner.find();
    const recommendations = await recommendationService.makeRecommendations(
      model,
      userId,
      numItems,
      businessOwners
    );

    res.json({ recommendations });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
