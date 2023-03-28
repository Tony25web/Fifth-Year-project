const mongoose = require("mongoose");
const propertySchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  typeOfProperty: {
    type: String,
    required: [true, "there must be a type for the property you want to add"],
    trim: true,
  },
  location: {
    type: String,
    required: [
      true,
      "there must be a location for the property you want to add",
    ],
    trim: true,
  },
  locationOnMap: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point",
    },
    coordinates: [Number],
  },
  height: {
    type: String,
    required: [true, "there must be a height for the property you want to add"],
    trim: true,
  },
  price: { type: Number },
  area: String,
  city: {
    type: String,
    default: "Homs",
  },
  details: {
    type: String,
    required: [true, "there must be details for the property you want to add"],
    trim: true,
  },
  property_Number: {
    type: Number,
    default: 0,
  },
  room_number: {
    type: Number,
    required: [true, "there must be a type for the property you want to add"],
    trim: true,
  },
  property_image: String,
  property_images: [String],
  isPropertyAccepted: Boolean,
  isSold: {
    type: Boolean,
    default: false,
  },
  isItForRental: {
    type: Boolean,
    default: false,
  },
});
propertySchema.pre("save", async function (next) {
  this.property_Number = this.property_Number + generateRandomNumbers();
});
function generateRandomNumbers(){
  return Math.floor(1000000+Math.random()*9000000)
}
module.exports = mongoose.model("Property", propertySchema);
