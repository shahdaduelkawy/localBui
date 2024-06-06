const express = require("express");
const { uploadProfilePic } = require("../middleware/fileUpload.middleware");
const { getIO } = require("../services/socket");
const BusinessOwnerService = require("../services/businessOwnerService");
const Customer = require("../models/customerModel");
const BusinessOwner = require("../models/businessOwnerModel");
const User = require("../models/userModel");

const router = express.Router();
const {
  isBusinessAlreadyFavorite,
  searchBusinessesByName,
  CustomerService,
  filterbycategory,
  countCustomerRatings,
} = require("../services/customerService");

const authService = require("../services/authService");

router.get(
  "/searchBusinesses/:businessName",
  authService.protect,
  authService.allowedTo("customer"),
  searchBusinessesByName
);

module.exports = router;
router.get(
  "/searchBusinesses/",
  authService.protect,
  authService.allowedTo("customer"),
  searchBusinessesByName
);
router.get(
  "/filterbycategory/:category",
  authService.protect,
  authService.allowedTo("customer"),
  filterbycategory
);
router.get(
  "/filterbycategory/",
  authService.protect,
  authService.allowedTo("customer"),
  filterbycategory
);
router.post(
  "/sendMessageToBusinessOwner/:customerId/:businessId",
  authService.protect,
  authService.allowedTo("customer"),
  async (req, res) => {
    const { customerId, businessId } = req.params;
    const { message } = req.body;

    try {
      const result = await CustomerService.sendMessageToBusinessOwner(
        customerId,
        businessId,
        message
      );

      if (result.success) {
        // Emit a message to the customer and business owner indicating new messages
        const io = getIO();
        io.to(customerId).emit("updatedMessages", {
          /* Update with relevant data based on your implementation */
        });
        io.to(businessId).emit("updatedMessages", {
          /* Update with relevant data based on your implementation */
        });

        res.status(200).json({
          success: true,
          message: "Message sent successfully",
          messageContent: result.messageContent,
        });
      } else {
        res
          .status(500)
          .json({ success: false, message: "Error sending message" });
      }
    } catch (error) {
      console.error("Error in sendMessageToBusinessOwner route:", error);
      res
        .status(500)
        .json({ success: false, message: "Internal Server Error" });
    }
  }
);
router.get(
  "/getAllMessages/:customerId/:businessId",
  authService.protect,
  authService.allowedTo("customer","businessOwner"),
  async (req, res) => {
    const { customerId, businessId } = req.params;

    try {
      // Call the service function to retrieve all messages
      const messages = await CustomerService.getAllMessages(
        customerId,
        businessId
      );

      // Return the messages in the response
      res.status(200).json({ success: true, messages });
    } catch (error) {
      console.error("Error fetching messages:", error.message);
      res
        .status(500)
        .json({ success: false, message: "Internal Server Error" });
    }
  }
);

router.patch(
  "/updateCustomerProfileImage/:customerId",
  authService.protect,
  authService.allowedTo("customer"),
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
  }
);
router.get(
  "/getBusinessesNearby",
  authService.protect,
  authService.allowedTo("customer"),
  async (req, res) => {
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
  }
);
router.post(
  "/:customerId/writeReview/:businessId",
  authService.protect,
  authService.allowedTo("customer"),
  async (req, res) => {
    try {
      const { customerId, businessId } = req.params;
      const { review } = req.body;

      // You might want to use middleware to extract the user ID from the request
      // const userId = extractUserId(req);

      const result = await CustomerService.writeReview(
        customerId,
        businessId,
        review
      );

      if (result.success) {
        return res
          .status(201)
          .json({ status: "success", message: result.message });
      }
      return res.status(400).json({ status: "fail", message: result.message });
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ status: "error", error: "Internal Server Error" });
    }
  }
);
router.post(
  "/:customerId/rate/:businessId",
  authService.protect,
  authService.allowedTo("customer"),
  async (req, res) => {
    try {
      const { customerId, businessId } = req.params;
      const { starRating } = req.body;

      const result = await CustomerService.rateBusiness(
        customerId,
        businessId,
        starRating
      );

      if (result) {
        return res
          .status(200)
          .json({ status: "success", message: result.message });
      }

      return res.status(400).json({ status: "fail", message: result.message });
    } catch (error) {
      console.error("Error submitting rating:", error);
      res
        .status(500)
        .json({ status: "error", message: "Internal Server Error" });
    }
  }
);
router.get(
  "/countRatings/:businessId",
  authService.protect,
  authService.allowedTo("customer","businessOwner" ),
  async (req, res) => {
    const { businessId } = req.params;

    try {
      const ratingCounts = await countCustomerRatings(businessId);
      res.status(200).json({ success: true, ratingCounts });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);
router.get(
  "/getBusinessById/:businessId",
  authService.protect,
  authService.allowedTo("customer"),
  async (req, res) => {
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
  }
);
router.patch(
  "/pincustomerOnMap/:customerId",
  authService.protect,
  authService.allowedTo("customer"),
  express.json(),
  async (req, res) => {
    const { customerId } = req.params;
    const { coordinates } = req.body;

    try {
      await CustomerService.pincustomerOnMap(customerId, coordinates);
      res.status(200).json({
        success: true,
        message: "customer location pinned successfully",
      });
    } catch (error) {
      console.error(
        `Error pinning customer on map  ${customerId}: ${error.message}`
      );

      // Check if the response has already been sent
      if (!res.headersSent) {
        res
          .status(500)
          .json({ success: false, message: "Internal Server Error" });
      }
    }
  }
);
router.post(
  "/addtofavorites/:customerId/:businessId",
  authService.protect,
  authService.allowedTo("customer"),
  async (req, res) => {
    try {
      const { customerId, businessId } = req.params; // Updated to use businessId

      // Check if the customer exists
      const customer = await Customer.findOne({ userId: customerId });
      if (!customer) {
        return { success: false, message: "Customer not found" };
      }

      // Fetch user details to get name and phone
      const user = await User.findById(customerId);
      if (!user) {
        return { success: false, message: "User not found" };
      }
      // Check if the business is already a favorite
      const isFavorite = customer.favoriteBusinesses.some((business) =>
        business.businessId.equals(businessId)
      );
      if (isFavorite) {
        return res.status(400).send({ error: "Business already favorited" });
      }
      customer.favoriteBusinesses.push({ businessId });
      await customer.save();
      res.status(201).send({ message: "Business favorited successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).send({ error: "Internal Server Error" });
    }
  }
);
router.delete(
  "/DeleteFavorites/:customerId/:businessId",
  authService.protect,
  authService.allowedTo("customer"),
  async (req, res) => {
    try {
      const { customerId, businessId } = req.params;
      // Check if the customer exists
      const customer = await Customer.findOne({ userId: customerId });
      if (!customer) {
        return { success: false, message: "Customer not found" };
      }

      // Fetch user details to get name and phone
      const user = await User.findById(customerId);
      if (!user) {
        return { success: false, message: "User not found" };
      }
      // Check if the business is favorited
      const isFavorite = customer.favoriteBusinesses.some((business) =>
        business.businessId.equals(businessId)
      );
      if (!isFavorite) {
        return res.status(400).send({ error: "Business not favorited" });
      }
      // Remove the business from favorites
      customer.favoriteBusinesses = customer.favoriteBusinesses.filter(
        (business) => !business.businessId.equals(businessId)
      );
      await customer.save();
      res
        .status(200)
        .send({ message: "Business removed from favorites successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).send({ error: "Internal Server Error" });
    }
  }
);
router.get(
  "/GetFavorites/:customerId",
  authService.protect,
  authService.allowedTo("customer"),
  async (req, res) => {
    try {
      const { customerId } = req.params;

      // Check if the customer exists
      const customer = await Customer.findOne({ userId: customerId });
      if (!customer) {
        return res
          .status(404)
          .send({ success: false, message: "Customer not found" });
      }

      // Fetch details of all favorite businesses
      const favoriteBusinessIds = customer.favoriteBusinesses.map(
        (favBusiness) => favBusiness.businessId
      );

      const favoriteBusinesses = await BusinessOwner.find({
        _id: { $in: favoriteBusinessIds },
      });

      // Construct the response data
      const response = favoriteBusinesses.map((business) => ({
        businessId: business._id,
        businessName: business.businessName,
        country: business.country,
        category: business.category,
        totalRate: business.totalRate,
        logo: business.logo,
      }));

      res.status(200).send({ favoriteBusinesses: response });
    } catch (error) {
      console.error(error);
      res.status(500).send({ error: "Internal Server Error" });
    }
  }
);

router.get(
  "/recommend/:customerId",
  authService.protect,
  authService.allowedTo("customer"),
  async (req, res) => {
    try {
      const { customerId } = req.params;
      const recommendedBusinesses =
        await CustomerService.recommendBusinessesToCustomer(customerId);
      res.status(200).json(recommendedBusinesses);
    } catch (error) {
      console.error(error);
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  }
);

router.get(
  "/totalRate/:businessId",
  authService.protect,
  authService.allowedTo("customer"),
  async (req, res) => {
    try {
      const { businessId } = req.params;
      const result = await BusinessOwnerService.getTotalRate(businessId);
      return res.status(200).json(result);
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ status: "error", error: "Internal Server Error" });
    }
  }
);

router.post(
  "/:customerId/serviceRequest/:businessId",
  authService.protect,
  authService.allowedTo("customer"),
  async (req, res) => {
    try {
      const { customerId, businessId } = req.params;
      const { requestDetails, name, phone, coordinates } = req.body;

      // Create service request with extracted ids
      const newRequest = await CustomerService.createServiceRequest(
        customerId,
        businessId,
        requestDetails,
        name,
        phone,
        coordinates
      );
      res.status(201).json(newRequest);
    } catch (error) {
      console.error("Error creating service request:", error);
      res
        .status(500)
        .json({ status: "error", message: "Internal Server Error" });
    }
  }
);

router.get(
  "/isBusinessAlreadyFavorite/:customerId/:businessId",
  authService.protect,
  authService.allowedTo("customer"),
  async (req, res) => {
    try {
      const { customerId, businessId } = req.params; // Updated to use businessId

      // Check if the business is already a favorite
      const isFavorite = await isBusinessAlreadyFavorite(
        customerId,
        businessId
      );
      if (isFavorite.success === false) {
        return res.status(404).send({ error: isFavorite.message });
      }

      // Return whether the business is already a favorite
      res.status(200).send({ isFavorite });
    } catch (error) {
      console.error(error);
      res.status(500).send({ error: "Internal Server Error" });
    }
  }
);

module.exports = router;
