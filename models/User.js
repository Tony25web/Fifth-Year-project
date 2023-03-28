const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
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
    phoneNumber: { type: String, trim: true },
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
    favorites: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Property",
      },
    ],
    profileImage: String,
  },
  { timestamps: true }
);
UserSchema.methods.generateJWT = function (next) {
  return jwt.sign({ user_id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRY_DATE,
  });
};
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const encryptedPassword = await bcrypt.hash(this.password, 12);
  this.password = encryptedPassword;
  next();
});
module.exports = mongoose.model("User", UserSchema);
/* the first solution for the login problem */

// field1: { $exists: true, $ne: "" },
//     field2: { $exists: true, $ne: null },
//     field3: { $exists: true, $ne: false },

/* the second solution for the login problem */
// field1: { $not: { $in: ["", null, false] } },
// field2: { $not: { $in: ["", null, false] } },
// field3: { $not: { $in: ["", null, false] } },
