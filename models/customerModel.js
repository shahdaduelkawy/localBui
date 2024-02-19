const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    profileImg: {
      type: String, 
      default: "Null",
      required: true,
    },
    messages: [
      {
        sender: String,
        content: String,
        timestamp: Date,
      },
    ],
  },
  { timestamps: true }
);

const customerModel = mongoose.model("Customer", customerSchema);

module.exports = customerModel;
