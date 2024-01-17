const express = require("express");
const router = express.Router();
const {uploadProfilePic} = require("../middleware/fileUpload.middleware");
const customer = require("../services/customerService");

router.patch(
  "/updateCustomerProfileImage/:customerId",
  uploadProfilePic.single("profileImage"), // Use uploadProfilePic middleware
  async (req, res) => {
    const customerId = req.params.customerId;
    const file = req.file;
    
    try {
      const uploadedImage = await customer.uploadCustomerImage(
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
  }
);

module.exports = router;
