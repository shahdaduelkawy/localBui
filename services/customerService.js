const Customer = require("../models/customerModel");
const { uploadProfilePic } = require("../middleware/fileUpload.middleware");

const customerService ={
  async uploadCustomerImage(customerId, file) {
    try {
      // Ensure that the file has been uploaded
      if (!file) {
        return { status: 400, message: "No file uploaded" };
      }
  
      const profileImage = file.path;
  
      // Update the customer profile with the image path
      const customer = await Customer.findByIdAndUpdate(
        customerId,
        { profileImg: profileImage },
        { new: true }
      );
  
      if (!customer) {
        return { status: 404, message: "Customer not found" };
      }
  
      return { status: 200, message: "Profile image uploaded successfully", customer };
    } catch (error) {
      console.error(error);
      return { status: 500, error: "Internal Server Error" };
    }
  }
  
  
}
module.exports = {
  uploadCustomerImage,
};
