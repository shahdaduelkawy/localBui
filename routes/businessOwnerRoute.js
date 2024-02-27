/* eslint-disable prefer-destructuring */
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

router.put("/profileSetup/:ownerID", async (req, res) => {
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

router.patch("/updateMyBusinessAttachment/:ownerID",
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

router.patch("/updateMyBusinessMedia/:ownerID",
upload.array("media", 10),
    async (req, res) => {
      const files = req.files;
      const ownerID = req.params.ownerID;
  
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
router.patch("/pinMyBusinessOnMap/:ownerID",
  express.json(), // Middleware for parsing JSON in the request body
  async (req, res) => {
    const { businessId } = req.params;
    const { coordinates } = req.body;

    try {
      await BusinessOwnerService.pinBusinessOnMap(ownerID, coordinates);
      res
        .status(200)
        .json({
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


module.exports = router;
