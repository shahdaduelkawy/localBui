const express = require("express");
const {upload} = require("../middleware/fileUpload.middleware");

const router = express.Router();
const CustomerService = require("../services/customerService");

//router.get("/searchBusinesses/:customerId/:businessName", customer.searchBusinessesByName);
router.patch("/updateCustomerProfileImage/:customerId",
  upload.single("profileImg"),
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
  }
);


module.exports = router;