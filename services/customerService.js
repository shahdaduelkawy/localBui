const Customer = require("../models/customerModel");
const BusinessOwner = require("../models/businessOwnerModel");
const { logActivity } = require("./activityLogService");


const uploadCustomerImage = async (customerId, file) => {
  try {
    if (!file) {
      return { status: 400, message: "No file uploaded" };
    }

    const profileImage = file.path;
    
    const customer = await Customer.findByIdAndUpdate(
      customerId,
      { profileImg: profileImage },
      { new: true }
    );

    if (!customer) {
      return { status: 404, message: "Customer not found" };
    }
    await logActivity(customerId, "uploadCustomerImage", "Profile image uploaded successfully");

    return {
      status: 200,
      message: "Profile image uploaded successfully",
      customer,
    };

  } catch (error) {
    console.error(error);
    return { status: 500, error: "Internal Server Error" };
  }
};

const searchBusinessesByName = async (req, res) => {
  try {
    const businessName = req.params.businessName;

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
  uploadCustomerImage
};
