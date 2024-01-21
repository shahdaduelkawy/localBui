const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    /* favourite: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // Reference to the userModel
      },
    ], */ // Is favourite an attribute or function?
  },
  { timestamps: true }
);
const customerModel = mongoose.model("customer", customerSchema);

module.exports = Customer;
