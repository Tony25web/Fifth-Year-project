const mongoose = require("mongoose");
const AgencySchema = new mongoose.Schema({
  agencyName: {
    type: String,
  },
  Email: { type: String, trim: true },
  password: { type: String, trim: true },
  agencyPhoneNumber: { type: String },
  location: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point",
    },
    coordinates: [Number],
  },
  agency_License: { type: Number, default: 0 },
});
module.exports = mongoose.model("Agency", AgencySchema);
