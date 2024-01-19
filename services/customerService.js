const Customer = require("../models/customerModel");

async function uploadCustomerImage(customerId, file) {
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

    return {
      status: 200,
      message: "Profile image uploaded successfully",
      customer,
    };
  } catch (error) {
    console.error(error);
    return { status: 500, error: "Internal Server Error" };
  }
}

module.exports = {
  uploadCustomerImage,
};
