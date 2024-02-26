const mongoose = require("mongoose");

const businessOwnerSchema = new mongoose.Schema(
  {
    business: {
      type: {
        type: String,
        required: true,
      },
      coordinates: {
        type: [Number],
      },
    },

    businessName: {
      type: String,
      trim: true,
      required: [true, "Business name is required"],
    },
    slug: {
      type: String,
      lowercase: true,
    },

    Country: {
      type: String,
      required: [true, "Country required"],
    },

    category: {
      type: String,
      required: [true, "category required"],
      enum: [
        "Restaurants and Cafés",
        "Retail Stores",
        "Health and Beauty Services",
        "Medical and Healthcare Services",
        "Tourism and Hospitality",
        "Education and Training Centers:",
        "Real Estate and Construction",
        "Real Estate and Construction",
        "Arts and Entertainment",
        "Home Services",
        "Auto Services",
        "Other",
      ],
    },
    attachment: {
      type: String,
      required: [true, "attachment required"],
    },
    status: {
      type: String,
      enum: ["pending", "rejected", "accepted"],
      default: "pending",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "businessOwner must be belong to parent user"],
    },
  },
  { timestamps: true }
);

const businessOwnerModel = mongoose.model("businessOwner", businessOwnerSchema);

module.exports = businessOwnerModel;
