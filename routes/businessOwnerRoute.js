/* eslint-disable no-undef */
const express = require("express");

const router = express.Router();
const upload = require("../middleware/fileUpload.middleware");

const BusinessOwnerService = require("../services/businessOwnerService");

router.get("/getAllUserBusinesses/:ownerID", async (req, res) => {
  const { ownerID } = req.params;

  try {
    const businesses = await BusinessOwnerService.getAllUserBusinesses(ownerID);

    if (businesses !== null) {
      res.status(200).json({ success: true, data: businesses });
    } else {
      res.status(404).json({ success: false, message: "No businesses found" });
    }
  } catch (error) {
    console.error("Error retrieving user businesses:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Internal Server Error",
        error: error.message,
      });
  }
});
router.put("/updateMyBusinessInfo/:ownerID", async (req, res) => {
  const { ownerID } = req.params;
  const data = req.body;

  try {
    const updatedData = await BusinessOwnerService.updateUserBusiness(
      ownerID,
      data
    );

    if (updatedData) {
      res.status(200).json({ success: true, data: updatedData });
    } else {
      res.status(404).json({ success: false, message: "Business not found" });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});
router.put("/profileSetup/:ownerID", async (req, res) => {
  try {
    const { ownerID } = req.params;
    const data = req.body;

    // Call the modified profileSetup function from BusinessOwnerService
    const result = await BusinessOwnerService.profileSetup(ownerID, data);

    if (result) {
      return res.status(200).json(result);
    }
    return res.status(500).json({ error: "Internal Server Error" });
  } catch (error) {
    console.error("Error in profileSetup route:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});
router.patch(
  "/updateMyBusinessAttachment/:ownerID",
  upload.single("img"),
  async (req, res) => {
    const { file } = req;
    const { ownerID } = req.params;

    try {
      const uploadedImage = await BusinessOwnerService.uploadImage(
        ownerID,
        file
      );

      if (uploadedImage) {
        res.status(200).json({ success: true, data: uploadedImage });
      } else {
        res
          .status(404)
          .json({ success: false, message: "Image Can't Be Uploaded" });
      }
    } catch (error) {
      res
        .status(500)
        .json({ success: false, message: "Internal Server Error" });
    }
  }
);
router.patch(
  "/updateMyBusinessMedia/:ownerID",
  upload.array("media", 10),
  async (req, res) => {
    const { files } = req;
    const { ownerID } = req.params;

    try {
      const uploadedmedia = await BusinessOwnerService.uploadedmedia(
        ownerID,
        files
      );

      if (uploadedmedia) {
        res.status(200).json({ success: true, data: uploadedmedia });
      } else {
        res
          .status(404)
          .json({ success: false, message: "Image Can't Be Uploaded" });
      }
    } catch (error) {
      res
        .status(500)
        .json({ success: false, message: "Internal Server Error" });
    }
  }
);
// Add new route for pinning business on the map
router.patch(
  "/pinMyBusinessOnMap/:ownerID",
  express.json(), // Middleware for parsing JSON in the request body
  async (req, res) => {
    const { ownerID } = req.params;
    const { coordinates } = req.body;

    try {
      await BusinessOwnerService.pinBusinessOnMap(ownerID, coordinates);
      res.status(200).json({
        success: true,
        message: "Business location pinned successfully",
      });
    } catch (error) {
      res
        .status(500)
        .json({ success: false, message: "Internal Server Error" });
    }
  }
);
router.post("/addMultipleBusinesses/:ownerID", async (req, res) => {
  const { ownerID } = req.params;
  const businessesData = req.body;

  try {
    // Check if businessesData is an array, if not, convert it to an array
    const businessesArray = Array.isArray(businessesData)
      ? businessesData
      : [businessesData];

    // Call the function to add multiple businesses
    const createdBusinesses = await BusinessOwnerService.addMultipleBusinesses(
      ownerID,
      businessesArray
    );

    if (createdBusinesses) {
      res.status(201).json({ success: true, data: createdBusinesses });
    } else {
      res.status(500).json({
        success: false,
        message: "Failed to add businesses. Internal Server Error",
      });
    }
  } catch (error) {
    console.error("Error adding multiple businesses:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});

module.exports = router;
