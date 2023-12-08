const express = require("express");
const router = express.Router();
// const {

//   createbusinessValidator,

// } = require('../utils/validators/businessOwnerValidator');

const BusinessOwnerService = require("../services/businessOwnerService");

// const authService = require('../services/authService');

//   router.use(authService.protect, authService.allowedTo('businessOwner'));
//   router.post(
//     '/',
//     setuserIdToBody,
//     createbusinessValidator,
//     createbusiness
//   );

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
  const data = req.body

  try {
    const updatedData = await BusinessOwnerService.updateUserBusiness(ownerID,data);

    if (updatedData) {
      res.status(200).json({ success: true, data: updatedData });
    } else {
      res.status(404).json({ success: false, message: "Business not found" });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

module.exports = router;
