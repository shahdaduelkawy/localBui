const express = require("express");
const { uploadProfilePic } = require("../middleware/fileUpload.middleware");
const { getIO } = require("../services/socket");
const BusinessOwnerService = require("../services/businessOwnerService");

const router = express.Router();
const {
  CustomerService,
  searchBusinessesByName,
  filterbycategory,
  rateBusiness,
  countCustomerRatings,
  createServiceRequest,
} = require("../services/customerService");


router.get("/searchBusinesses/:businessName", searchBusinessesByName);
router.get("/searchBusinesses/", searchBusinessesByName);
router.get("/filterbycategory/:category", filterbycategory);
router.get("/filterbycategory/", filterbycategory);
//customer send Message To BusinessOwner
router.post("/sendMessageToBusinessOwner/:customerId/:businessId", async (req, res) => {
  const { customerId, businessId } = req.params;
  const { message } = req.body;

  try {
    const result = await CustomerService.sendMessageToBusinessOwner(customerId, businessId, message);

    if (result.success) {
      // Emit a message to the customer and business owner indicating new messages
      const io = getIO();
      io.to(customerId).emit("updatedMessages", {
        /* Update with relevant data based on your implementation */
      });
      io.to(businessId).emit("updatedMessages", {
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
// Customer update his Profile Image
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
  //customer find nearest business
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
      console.error("Error getting nearby businesses:", error);
  
      // Check if the response has already been sent
      if (!res.headersSent) {
        res
          .status(500)
          .json({ success: false, message: "Internal Server Error" });
      }
    }
  });
  //customer write review to business
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
    //customer rating the business
  router.post('/:customerId/rate/:businessId', async (req, res) => {
    try {
      const { customerId, businessId } = req.params;
      const { starRating } = req.body;
  
      const result = await rateBusiness(customerId, businessId, starRating);
  
      if (result) {
        return res.status(200).json({ status: 'success', message: result.message });
      }
  
      return res.status(400).json({ status: 'fail', message: result.message });
    } catch (error) {
      console.error('Error submitting rating:', error);
      res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
  });
router.get('/countRatings/:businessId', async (req, res) => {
  const { businessId } = req.params;

  try {
    const ratingCounts = await countCustomerRatings(businessId);
    res.status(200).json({ success: true, ratingCounts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
router.get("/getBusinessById/:businessId", async (req, res) => {
  const { businessId } = req.params;

  try {
    const business = await CustomerService.getBusinessById(businessId);

    if (business !== null) {
      res.status(200).json({ success: true, data: business });
    } else {
      res.status(404).json({ success: false, message: "No business found" });
    }
  } catch (error) {
    console.error("Error retrieving  business:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
});
router.post('/:customerId/serviceRequest/:businessId', async (req, res) => {
  try {
      const { customerId, businessId } = req.params;
      const { requestDetails } = req.body;

     // Create service request with extracted ids
     const newRequest = await createServiceRequest(customerId, businessId, requestDetails);
     res.status(201).json(newRequest);
 } catch (error) {
     console.error('Error creating service request:', error);
     res.status(500).json({ status: 'error', message: 'Internal Server Error' });
 }
});


module.exports = router;
 
