const Customer = require("../models/customerModel");

const imageMiddleware = require("../middleware/uploadImageMiddleware");

const uploadCustomerImage = async (req, res) => {
  try {
    const customerId = req.params.customerId;
    const profileImage = req.file.path;

    // Update the customer profile with the image path
    const customer = await Customer.findByIdAndUpdate(
      customerId,
      { profileImg: profileImage },
      { new: true }
    );

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    return res
      .status(200)
      .json({ message: "Profile image uploaded successfully", customer });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
  uploadCustomerImage,
};
