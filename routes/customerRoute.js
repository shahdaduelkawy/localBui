const express = require("express");
const { uploadProfilePic } = require("../middleware/fileUpload.middleware");
const { getIO } = require("../services/socket");

const router = express.Router();
const {
  CustomerService,
  searchBusinessesByName,
  filterbycategory,
} = require("../services/customerService");

router.post("/sendMessageToBusinessOwner/:customerId/:ownerId", async (req, res) => {
  const { customerId, ownerId } = req.params;
  const { message } = req.body;

  try {
    const result = await CustomerService.sendMessageToBusinessOwner(customerId, ownerId, message);

    if (result.success) {
      // Emit a message to the customer and business owner indicating new messages
      const io = getIO();
      io.to(customerId).emit("updatedMessages", {
        /* Update with relevant data based on your implementation */
      });
      io.to(ownerId).emit("updatedMessages", {
        /* Update with relevant data based on your implementation */
      });

      res.status(200).json({ success: true, message: "Message sent successfully" });
    } else {
      res.status(500).json({ success: false, message: "Error sending message" });
    }
  } catch (error) {
    console.error("Error in sendMessageToBusinessOwner route:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

router.get("/searchBusinesses/:businessName", searchBusinessesByName);
router.get("/searchBusinesses/", searchBusinessesByName);

router.get("/filterbycategory/:category", filterbycategory);
router.get("/filterbycategory/", filterbycategory);


router.patch("/updateCustomerProfileImage/:customerId",
uploadProfilePic.single("profileImg"),
   async (req, res) => {
    const { file } = req;
    const { customerId } = req.params;

    try {
      const uploadedImage = await CustomerService.uploadCustomerImage(
        customerId,
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
      console.error(error);
      res
        .status(500)
        .json({ success: false, message: "Internal Server Error" });
    }
  });
router.post("/:customerId/writeReview/:businessId", async (req, res) => {
  try {
    const { customerId, businessId } = req.params;
    const { review } = req.body;

    // You might want to use middleware to extract the user ID from the request
    // const userId = extractUserId(req);

    const result = await CustomerService.writeReview(customerId, businessId, review);

    if (result.success) {
      return res.status(201).json({ status: "success", message: result.message });
    } 
      return res.status(400).json({ status: "fail", message: result.message });
    
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: "error", error: "Internal Server Error" });
  }
  });


module.exports = router;
