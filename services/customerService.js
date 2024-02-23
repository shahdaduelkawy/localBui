const Customer = require("../models/customerModel");
const { logActivity } = require("./activityLogService");
const BusinessOwner = require("../models/businessOwnerModel");
const ApiError = require('../utils/apiError');


const CustomerService = {
  async sendMessageToBusinessOwner(customerId, ownerId, message) {
    try {
      // Check if the customer exists
      const customer = await Customer.findOne({ userId: customerId });

      if (!customer) {
        throw new ApiError(`Customer not found for ID: ${customerId}`, 404);
      }

      // Check if the business owner exists
      const businessOwner = await BusinessOwner.findOne({ userId: ownerId });

      if (!businessOwner) {
        throw new ApiError(`Business owner not found for ID: ${ownerId}`, 404);
      }

      // Ensure `messages` arrays exist and are not empty
      customer.messages = Array.isArray(customer.messages) ? customer.messages : [];
      businessOwner.messages = Array.isArray(businessOwner.messages) ? businessOwner.messages : [];

      // Create the message objects consistently
      const customerMessage = {
        sender: 'customer',
        content: message,
        timestamp: new Date(),
      };

      const businessOwnerMessage = {
        sender: 'customer',
        content: message, // Ensure content is set correctly
        timestamp: new Date(),
      };

      // Push messages into the arrays
      customer.messages.push(customerMessage);
      businessOwner.messages.push(businessOwnerMessage);

      // Ensure data is saved to the database
      await customer.save();
      await businessOwner.save();

      // Log activity after saving for consistency
      await logActivity(customerId, "sendMessageToBusinessOwner", "Message sent successfully");

      // Return the updated messages and status
      return {
        success: true,
        message: "Message sent successfully",
        customerMessages: customer.messages,
        businessOwnerMessages: businessOwner.messages,
      };
    } catch (error) {
      console.error(`Error sending message: ${error.message}`);
      throw new ApiError("Error sending message", error.statusCode || 500);
    }
  },

  
  async uploadCustomerImage(customerId, file) {
    try {
      const updateResult = await Customer.updateOne(
        { userId: customerId, },
        { profileImg: file.path, }
      );

     await logActivity(customerId, "uploadImage", "Image uploaded successfully");

      return updateResult;
    } catch (error)  {
      return error.message;
      
    }
  }, 
   //customer can write a review to businessowner 
  async writeReview(customerId, businessId, review) {
    try {
      const customer = await Customer.findOne({ userId: customerId });

      if (!customer) {
        return { success: false, message: "Customer not found" };
      }

      // Check if the provided businessId exists
      const business = await BusinessOwner.findById(businessId);

      if (!business) {
        return { success: false, message: "Business not found" };
      }

      // Add the review to the customer's reviews array
      customer.reviews.push({
        businessId: businessId,
        content: review,
        timestamp: new Date(),
      });

      // Save the updated customer
      await customer.save();

      // Add the review to the businessOwnerModel's reviews array
      business.reviews.push({
        customerId: customerId,
        content: review,
        timestamp: new Date(),
      });

      // Save the updated businessOwnerModel
      await business.save();

      await logActivity(
        customerId,
        "writeReview",
        `Wrote a review for ${business.businessName}`
      );

      return { success: true, message: "Review added successfully" };
    } catch (error) {
      console.error(error);
      return { success: false, message: "Internal Server Error" };
    }
  },
  



};

  const searchBusinessesByName = async (req, res) => {
    try {
      const {businessName} = req.params;
  
      // Use a case-insensitive regex for the search
      const regex = new RegExp(businessName, 'i');
  
      // Search for businesses with names matching the provided term
      const businesses = await BusinessOwner.find({ businessName: regex });
  
      // Check if businesses were found
      if (businesses.length === 0) {
        return res.status(404).json({ status: 'fail', message: 'No businesses found for the given search term' });
      }
  
      // Return the number of businesses found along with the list of businesses
      return res.status(200).json({ status: 'success', count: businesses.length, businesses });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ status: 'error', error: "Internal Server Error" });
    }
  };
  module.exports = {
    searchBusinessesByName,
    CustomerService
  };
 
  
  