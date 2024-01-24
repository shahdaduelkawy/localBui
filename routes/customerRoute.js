const express = require("express");
const router = express.Router();
const { uploadProfilePic } = require("../middleware/fileUpload.middleware");
const customerService = require("../services/customerService");

router.patch(
  "/updateCustomerProfileImage/:customerId",
  uploadProfilePic.single("profileImg"),  // Change "profileImage" to "profileImg"
  async (req, res) => {
    try {
      const customerId = req.params.customerId;
      const file = req.file;

      if (!file) {
        console.error("File not found in the request.");
        console.log("no file");
        return res.status(400).json({ status: 400, error: "File not found" });
      }

      console.log("Uploading");
      const result = await customerService.uploadCustomerImage(
        customerId,
        file
      );

      res.status(result.status).json(result);
    } catch (error) {
      console.error(error);
      res.status(500).json({ status: 500, error: "Internal Server Error" });
    }
  }
);

module.exports = router;
