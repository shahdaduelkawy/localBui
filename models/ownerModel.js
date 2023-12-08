const mongoose = require('mongoose');

const ownerSchema = new mongoose.Schema(
  {
    businessName: {
      type: String,
      trim: true,
      required: [true, 'Business name is required'],
    },
    slug: {
      type: String,
      lowercase: true,
    },
    location: {
        type: {
          type: String,
          enum: ['Point'],
          default: 'Point',
        },
        coordinates: {
          type: [Number],
          required: [true, 'Location coordinates are required'],
        },
      },
    Country: {
        type: String,
        required: [true, 'Country required'],
      },

      category: {
        type: String,
        required: [true, 'category required'],
        enum: ['Restaurants and Cafés',
        'Retail Stores',
        'Health and Beauty Services',
        'Medical and Healthcare Services',
        'Tourism and Hospitality',
        'Education and Training Centers:',
        'Real Estate and Construction',
        'Real Estate and Construction',
        'Arts and Entertainment',
        'Home Services',
        'Auto Services',
        'Other',
    ],
      },
      attachment: {
        type: String,
        required: [true, 'attachment required'],
      },
      status: {
        type: Boolean,
        default: true,
      },

      status: {
        type: String,
        enum: ['pending', 'rejected', 'accepted'],
        default: pending ,
      },
  },
  { timestamps: true }
);


const Owner = mongoose.model('Owner', ownerSchema);

module.exports = Owner;
