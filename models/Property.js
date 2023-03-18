const mongoose = require("mongoose");
const propertySchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  agency_id: { type: mongoose.Schema.Types.ObjectId, ref: "Agency" },
  location: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point",
    },
    coordinates: [Number],
  },
  price: { type: Number },
  area: String,
  room_number: Number,
  property_image: String,
  property_images: [String],
  isPropertyAccepted: Boolean,
});
module.exports = mongoose.model("Property", propertySchema);
