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
    reviews: [
      {
        businessId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "businessOwner", // Change this to match the model name
          required: true,
        },
        content: String,
        starRating: {
          type: Number,
          enum: [1, 2, 3, 4, 5],
        },
        timestamp: Date,
        userName: String
      },
    ],
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
