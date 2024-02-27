const express = require("express");

const router = express.Router();
const { upload, uploadProfilePic} = require("../middleware/fileUpload.middleware");
const BusinessOwnerService = require("../services/businessOwnerService");
const ApiError = require("../utils/apiError");
const { getIO } = require("../services/socket");


// Assuming you have a function to send messages to customers in your service
router.post("/sendMessageToCustomer/:ownerID/:customerID", async (req, res) => {
  const { ownerID, customerID } = req.params;
  const { message } = req.body;

  try {
    const result = await BusinessOwnerService.sendMessageToCustomer(
      ownerID,
      customerID,
      message
    );

    if (result.success) {
      // Emit a message to the business owner and customer indicating new messages
      const io = getIO(); // Use getIO function to retrieve the io object
      io.to(ownerID).emit("updatedMessages", {
        /* Update with relevant data based on your implementation */
      });
      io.to(customerID).emit("updatedMessages", {
        /* Update with relevant data based on your implementation */
      });

      res
        .status(200)
        .json({ success: true, message: "Message sent successfully" });
    } else {
      res
        .status(500)
        .json({ success: false, message: "Error sending message" });
    }
  } catch (error) {
    console.error("Error in sendMessageToCustomer route:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});
router.put("/updateMyBusinessInfo/:businessId", async (req, res) => {
  const { businessId } = req.params;
  const data = req.body;

  try {
    const updatedData = await BusinessOwnerService.updateUserBusiness(
      businessId,
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
router.put("/profileSetup/:businessId", async (req, res) => {
  try {
    const { businessId } = req.params;
    const data = req.body;

    // Call the modified profileSetup function from BusinessOwnerService
    const result = await BusinessOwnerService.profileSetup(businessId, data);

    if (result) {
      return res.status(200).json(result);
    }
    return res.status(500).json({ error: "Internal Server Error" });
  } catch (error) {
    console.error("Error in profileSetup route:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});
router.patch("/updateMyBusinessAttachment/:businessId",
  upload.single("img"),
  async (req, res) => {
    const { file } = req;
    const { businessId } = req.params;

    try {
      const uploadedImage = await BusinessOwnerService.uploadImage(
        businessId,
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
router.patch("/updateMyBusinessMedia/:businessId",
  upload.array("media", 10),
  async (req, res) => {
    const { files } = req;
    const { businessId } = req.params;

    try {
      const uploadedmedia = await BusinessOwnerService.uploadedmedia(
        businessId,
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
router.patch("/addLogoToBusiness/:businessId",
  upload.single("logo"),
  async (req, res) => {
    const { file } = req;
    const { businessId } = req.params;

    try {
      const addedLogo = await BusinessOwnerService.addLogo(businessId, file);

      if (addedLogo) {
        res.status(200).json({ success: true, data: addedLogo });
      } else {
        res
          .status(404)
          .json({ success: false, message: "Logo can't be added to business" });
      }
    } catch (error) {
      res
        .status(500)
        .json({ success: false, message: "Internal Server Error" });
    }
  }
);
router.delete("/deleteBusiness/:businessId", async (req, res) => {
  const { businessId } = req.params;

  try {
    const deletionResult =
      await BusinessOwnerService.deleteBusinessById(businessId);

    if (deletionResult && deletionResult.deletedCount > 0) {
      res
        .status(200)
        .json({ success: true, message: "Business deleted successfully" });
    } else {
      res.status(404).json({ success: false, message: "Business not found" });
    }
  } catch (error) {
    console.error("Error deleting business:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});
//get all the Businesses htat the owner have
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
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
});
//get all the user information
router.get("/getUserByUserID/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await BusinessOwnerService.getUserByUserID(userId);

    if (user) {
      res.status(200).json({ success: true, data: user });
    } else {
      res.status(404).json({ success: false, message: 'User not found' });
    }
  } catch (error) {
    console.error("Error getting user data by userId:", error);

    if (error instanceof ApiError) {
      res
        .status(error.statusCode)
        .json({ success: false, message: error.message });
    } else {
      res
        .status(500)
        .json({ success: false, message: "Internal Server Error" });
    }
  }
});
router.patch( "/addImageToUserProfile/:userId",
  uploadProfilePic.single("userProfile"),
  async (req, res) => {
    const { file  } = req;
    const { userId } = req.params;

    try {
      const uploadedImage = await BusinessOwnerService.addImageToUserProfile(
        userId,
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

module.exports = router;
