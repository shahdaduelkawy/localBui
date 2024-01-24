const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    profileImg: {
      type: String, 
    },
  },
  { timestamps: true }
);

const customerModel = mongoose.model("customermodels", customerSchema);

module.exports = customerModel;
