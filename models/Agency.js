const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const AgencySchema = new mongoose.Schema(
  {
    agencyName: {
      type: String,
      required: [true, "the agency must be provided"],
    },
    Email: {
      type: String,
      trim: true,
      required: [true, "email must be provided"],
    },
    password: {
      type: String,
      trim: true,
      required: [true, "password must be provided"],
    },
    PasswordChangedAt: Date,
    passwordResetCode: Number,
    passwordResetIsVerified: Boolean,
    passwordResetCodeExpirationTime: String,
    agencyPhoneNumber: {
      type: String,
      required: [true, "phone number must be provided"],
    },
    role: {
      type: String,
      required: [
        true,
        "you must be an office manager to signUp as an office manager",
      ],
      enum: ["officeManager"],
    },
    locationOnMap: {
      type: {
        type: String, // Don't do `{ location: { type: String } }`
        enum: ["Point"], // 'location.type' must be 'Point'
        required: true,
        default: "Point",
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    location: {
      type: String,
      required: [
        true,
        "there must be a location for the property you want to add",
      ],
      trim: true,
    },
    agency_License: {
      type: Number,
      required: [
        true,
        "you must provide a license to prove that you are an office manager",
      ],
    },
    properties: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Property",
      },
    ],
    isAgency: {
      type: Boolean,
      default: false,
    },
    agency_image: {
      type: String,
    },
  },
  { timestamps: true }
);
AgencySchema.index({locationOnMap:"2dsphere"})
AgencySchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const encryptedPassword = await bcrypt.hash(this.password, 12);
  this.password = encryptedPassword;
  next();
});
AgencySchema.methods.generateJWT = function (next) {
  return jwt.sign({ user_id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRY_DATE,
  });
};
function setTheImageUrl(doc) {
  if (doc.profileImage) {
    const imageUrl = `${process.env.BASE_URL}/user/profile/${doc.profileImage}`;
    doc.profileImage = imageUrl;
  }
}
AgencySchema.post("init", function (doc) {
  setTheImageUrl(doc);
});
AgencySchema.post("save", function (doc) {
  setTheImageUrl(doc);
});
module.exports = mongoose.model("Agency", AgencySchema);
