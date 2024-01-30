const Customer = require("../models/customerModel");
const BusinessOwner = require("../models/businessOwnerModel");

const { logActivity } = require("./activityLogService");

const CustomerService = {

  async uploadCustomerImage(customerId, file) {
    try {
      const updateResult = await Customer.updateOne(
        { userID: customerId },
        { profileImg: file.path }
      );
      
      await logActivity(customerId, "uploadImage", "Image uploaded successfully");
  
      return updateResult;
    } catch (error) {
      return error.message;
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
module.exports = CustomerService;

