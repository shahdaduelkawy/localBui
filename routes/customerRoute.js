const express = require("express");
const { uploadProfilePic } = require("../middleware/fileUpload.middleware");
const { getIO } = require("../services/socket");
const BusinessOwnerService = require("../services/businessOwnerService");
const Customer = require("../models/customerModel");
const BusinessOwner = require("../models/businessOwnerModel");

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

router.post('/favorites/:customerId/:businessId', async (req, res) => {
  try {
      const { customerId, businessId } = req.params; // Updated to use businessId
      const customer = await Customer.findOne({ userId: customerId });
      if (!customer) {
          return res.status(404).send({ error: 'Customer not found' });
      }
      // Check if the business is already a favorite
      const isFavorite = customer.favoriteBusinesses.some(business => business.businessId.equals(businessId));
      if (isFavorite) {
          return res.status(400).send({ error: 'Business already favorited' });
      }
      customer.favoriteBusinesses.push({ businessId });
      await customer.save();
      res.status(201).send({ message: 'Business favorited successfully' });
  } catch (error) {
      console.error(error);
      res.status(500).send({ error: 'Internal Server Error' });
  }
});

router.delete('/favorites/:customerId/:businessId', async (req, res) => {
  try {
      const { customerId, businessId } = req.params;
      const customer = await Customer.findOne({ userId: customerId });
      if (!customer) {
          return res.status(404).send({ error: 'Customer not found' });
      }
      // Check if the business is favorited
      const isFavorite = customer.favoriteBusinesses.some(business => business.businessId.equals(businessId));
      if (!isFavorite) {
          return res.status(400).send({ error: 'Business not favorited' });
      }
      // Remove the business from favorites
      customer.favoriteBusinesses = customer.favoriteBusinesses.filter(business => !business.businessId.equals(businessId));
      await customer.save();
      res.status(200).send({ message: 'Business removed from favorites successfully' });
  } catch (error) {
      console.error(error);
      res.status(500).send({ error: 'Internal Server Error' });
  }
});

router.get('/favorites/:customerId', async (req, res) => {
  try {
      const { customerId } = req.params.customerId;
      
      const customer = await Customer.findOne({ userId: customerId });      
      if (!customer) {
          return res.status(404).send({ error: 'Customer not found' });
      }
      
      // Extract business names from favoriteBusinesses array
      const favoriteBusinessNames = await Promise.all(customer.favoriteBusinesses.map(async (favorite) => {
        const business = await BusinessOwner.findById(favorite.businessId);
        return business ? business.businessName : null;
      }));
      
      // Filter out null values and send the response
      res.status(200).send(favoriteBusinessNames.filter(name => name !== null));
  } catch (error) {
      console.error(error);
      res.status(500).send({ error: 'Internal Server Error' });
  }
});
router.get('/recommend/:customerId', async (req, res) => {
  try {
    const customerId = req.params.customerId;
    const recommendedBusinesses = await CustomerService.recommendBusinessesToCustomer(customerId);
    res.status(200).json(recommendedBusinesses);
  } catch (error) {
    console.error(error);
    res.status(error.statusCode || 500).json({ message: error.message });
  }
});
router.get('/totalRate/:businessId', async (req, res) => {
  try {
    const { businessId } = req.params;

    // Find the business by ID
    const business = await BusinessOwner.findById(businessId);

    if (!business) {
      return res.status(404).json({ status: 'fail', message: 'Business not found' });
    }

    // Log the reviews for debugging
    console.log('Reviews:', business.reviews);

    // Filter out reviews with undefined starRating
    const ratedReviews = business.reviews.filter(review => typeof review.starRating !== 'undefined');

    // Calculate the average rating
    const totalRatings = ratedReviews.length;

    if (totalRatings === 0) {
      return res.status(200).json({ status: 'success', rating: 0, message: 'No reviews yet' });
    }

    const totalRating = ratedReviews.reduce((sum, review) => {
      console.log('Star Rating:', review.starRating); // Log each starRating value
      return sum + review.starRating;
    }, 0);

    console.log('Total Rating:', totalRating);
    console.log('Total Ratings:', totalRatings);

    const averageRating = totalRating / totalRatings;

    // Return the average rating
    return res.status(200).json({ status: 'success', rating: averageRating });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: 'error', error: 'Internal Server Error' });
  }
});





module.exports = router;
 
