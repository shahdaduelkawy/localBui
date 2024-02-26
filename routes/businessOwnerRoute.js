/* eslint-disable prefer-destructuring */
const express = require("express");

const router = express.Router();
const upload = require("../middleware/fileUpload.middleware");

const BusinessOwnerService = require("../services/businessOwnerService");

router.get("/getMyBusiness/:ownerID", async (req, res) => {
  const ownerID = req.params.ownerID;

  try {
    const businessData = await BusinessOwnerService.getUserBusiness(ownerID);

    if (businessData) {
      res.status(200).json({ success: true, data: businessData });
    } else {
      res.status(404).json({ success: false, message: "Business not found" });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

router.put("/updateMyBusinessInfo/:ownerID", async (req, res) => {
  const ownerID = req.params.ownerID;
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

router.patch(
  "/updateMyBusinessAttachment/:ownerID",
  upload.single("img"),
  async (req, res) => {
    const file = req.file;
    const ownerID = req.params.ownerID;

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
          .json({ success: false, message: "Image Cant Be Uploaded" });
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
    const ownerID = req.params.ownerID;
    const coordinates = req.body.coordinates;

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

router.get("/getBusinessesNearby", async (req, res) => {
  const { longitude, latitude, minDistance, maxDistance } = req.query;

  try {
    const nearbyBusinesses = await BusinessOwnerService.getBusinessesNearby(
      longitude,
      latitude,
      minDistance,
      maxDistance
    );

    res.status(200).json({ success: true, data: nearbyBusinesses });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});
module.exports = router;
