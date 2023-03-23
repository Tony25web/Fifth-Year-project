const mongoose = require("mongoose");
const propertySchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  type: {
    type: String,
    required: [true, "there must be a type for the property you want to add"],
    trim: true,
  },
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
  city: String,
  details: String,
  property_id: {
    type: Number,
    default: 0,
  },
  postalCode: Number,
  room_number: Number,
  property_image: String,
  property_images: [String],
  isPropertyAccepted:Boolean,
  isSold: {
    type: Boolean,
    default:false
  },
  
});
module.exports = mongoose.model("Property", propertySchema);
