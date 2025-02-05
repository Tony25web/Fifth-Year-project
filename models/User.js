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
    email: { type: String, trim: true },
    password: { type: String, trim: true },
    PasswordChangedAt: Date,
    passwordResetCode: String,
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
    address: [{ type: String }],
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

function setTheImageUrl(doc) {
  if (doc.profileImage) {
    const imageUrl = `${process.env.BASE_URL}/users/${doc.profileImage}`;
    doc.profileImage = imageUrl;
  }
}
UserSchema.post("init", function (doc) {
  setTheImageUrl(doc);
});
UserSchema.post("save", function (doc) {
  setTheImageUrl(doc);
});
module.exports = mongoose.model("User", UserSchema);
