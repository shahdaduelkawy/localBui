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
        userName:String

      },
    ],
    favoriteBusinesses: [
      {
        businessId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "businessOwner", // Reference the business owner model
        }
      }
    ],
    customer: {
      type: {
        type: String,
        enum: ["Point"], // Specify the GeoJSON type
        default: "Point",
      },
      coordinates: {
        type: [Number],
        default: [0, 0], // Default coordinates [longitude, latitude]
      },
    },
  },
  { timestamps: true }
);

const customerModel = mongoose.model("Customer", customerSchema);

module.exports = customerModel;
