const mongoose = require("mongoose");

const businessOwnerSchema = new mongoose.Schema(
  {
    station: {
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
    /*  location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point',
        },
      
    },*/
    // coordinates : {
    //     type : [Number]
    // },
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
    description: {
      type: String,
      required: false,
    },
    address: {
      type: String,
      required: false,
    },
    logo: {
      type: Buffer, 
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

  },
  { timestamps: true }
);

const businessOwnerModel = mongoose.model("businessOwner", businessOwnerSchema);

module.exports = businessOwnerModel;
