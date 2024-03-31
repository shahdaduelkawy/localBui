/* eslint-disable global-require */
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const { logActivity } = require("../services/activityLogService");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, "name required"],
    },
    slug: {
      type: String,
      lowercase: true,
    },
    email: {
      type: String,
      required: [true, "email required"],
      unique: true,
      lowercase: true,
    },
    phone: String,
    profileImg: String,

    password: {
      type: String,
      required: [true, "password required"],
      minlength: [4, "Too short password"],
    },
    passwordChangedAt: Date,
    passwordResetCode: String,
    passwordResetExpires: Date,
    passwordResetVerified: Boolean,
    role: {
      type: String,
      enum: ["customer", "businessOwner", "admin", "subAdmin"],
      required: [true, "role required"],
    },
    gender: {
      type: String,
      enum: ["female", "male"],
    },
    birthday: {
      type: Date,
    },
    userProfile: {
      type: String, 
      default: "Null",
      required: false,
    },
    online: {
      type: Boolean,
      default: false, // Initially set to offline
    },
    lastSeenAt: {
      type: Date,
      default: Date.now,
    },
  
  },
  { timestamps: true }
);

userSchema.methods.changePassword = async function (oldPassword, newPassword) {
  // Check if the provided old password matches the current password
  const isPasswordMatch = await bcrypt.compare(oldPassword, this.password);

  if (!isPasswordMatch) {
    throw new Error("Incorrect old password");
  }

  // Log activity
  await logActivity(this._id, "changePassword", "User changed their password successfully");

  // Change the password
  this.password = newPassword;
  await this.save();
};


userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  // Hashing user password
  this.password = await bcrypt.hash(this.password, 12);
  next();
});


userSchema.post("save", async (doc, next) => {
  if (doc.role === "businessOwner") {
    try {
      const BusinessOwner = require("./businessOwnerModel");
      await BusinessOwner.create({
        businessName: "My Business",
        userId: doc._id,
        attachment: "null", //this is default values
        Country: "Egypt",
        category: "Other",
      });
    } catch (err) {
      console.error("Error creating business owner:", err);
    }
  }
  next();
});
userSchema.post("save", async (doc, next) => {
  if (doc.role === "customer") {
    try {
      const Customer = require("./customerModel");
      await Customer.create({
        profileImg: "Null",
        userId: doc._id,
        
      });
    } catch (err) {
      console.error("Error creating business owner:", err);
    }
  }
  next();
});

const User = mongoose.model("User", userSchema);

module.exports = User;
