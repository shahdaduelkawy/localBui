const mongoose = require("mongoose");

const businessOwnerSchema = new mongoose.Schema(
  {
    business: {
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
    category: String,
   

    attachment: {
      type: String,
      required: false,
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
    media: {
      type: [String],
      required: false,
    },

    totalRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    description: {
      type: String,
      required: false,
    },
    address: {
      type: String,
      required: false,
    },
    logo: {
      type: [String],
      required: false,
    },
    workTime: {
      startTime: {
        type: String,
        required: false,
      },
      endTime: {
        type: String,
        required: false,
      },
    },
    days: {
      type: [String],
      enum: [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday", // Corrected spelling here
        "Thursday",
        "Friday",
        "Saturday",
      ],
    },
    messages: [
      {
        businessId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "businessOwner", // Change this to match the model name
          required: true,
        },
        customerId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Customer",
          required: true,
        },       
         sender: String,
        content: String,
        timestamp: Date,
        userName:String

      },
    ],
    reviews: [
      {
        customerId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Customer",
          required: true,
        },
        content: String,
        starRating: {
          type: Number,
          enum: [1, 2, 3, 4, 5],
        },
        timestamp: Date,
        userName: String,
      },
    ],
    expirationDate: {
      type: Date,
      required: false,
    },
    eventOrNot: {
      type: String,
      enum: ["Event", "notEvent"],
      required: false,
      default: "notEvent",
    },
  },
  { timestamps: true }
);

const businessOwnerModel = mongoose.model("businessOwner", businessOwnerSchema);

module.exports = businessOwnerModel;
