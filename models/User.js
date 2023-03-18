const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const UserSchema = new mongoose.Schema(
  {
    fullName: { type: String, trim: true },
    slug: {
      type: String,
      trim: true,
      lowercase: true,
    },
    Email: { type: String, trim: true },
    password: { type: String, trim: true },
    PasswordChangedAt: Date,
    passwordResetCode: Number,
    passwordResetIsVerified: Boolean,
    passwordResetCodeExpirationTime: String,
    phone_number: { type: String, trim: true },
    role: {
      type: String,
      enum: ["admin", "user", "officeManager"],
      default: "user",
    },
    favorites: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Property",
      },
    ],
    addresses: [
      {
        alias: String,
        details: String,
        phone: Number,
        city: String,
        postalCode: Number,
      },
    ],
    isLicensed: Boolean,
    isAgency: Boolean,
    profileImage: String,
  },
  { timestamps: true }
);
UserSchema.methods.generateJWT = function () {
  return jwt.sign({ user_id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRY_DATE,
  });
};

module.exports = mongoose.model("User", UserSchema);
