const mongoose = require("mongoose");
const propertySchema = new mongoose.Schema(
  {
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
      },
      coordinates: [Number],
    },
    height: {
      type: String,
      required: [
        true,
        "there must be a height for the property you want to add",
      ],
      trim: true,
    },
    price: { type: Number },
    area: Number,
    city: {
      type: String,
      default: "Homs",
    },
    details: {
      type: String,
      required: [
        true,
        "there must be details for the property you want to add",
      ],
      trim: true,
    },
    propertyNumber: {
      type: Number,
      unique: [
        true,
        "the property must have a number to indicate which property you want to add",
      ],
    },
    room_number: {
      type: Number,
      required: [
        true,
        "there must be a number of the rooms for the property you want to add",
      ],
      trim: true,
    },
    realEstateArea: {
      type: String,
      unique: true,
      required: [
        true,
        "there must be a real estate area for the property you want to add",
      ],
    },
    property_image: {
      type: String,
      required: [true, "the property must have at least a cover image"],
    },
    property_images: [String],
    isSold: {
      type: Boolean,
      default: false,
    },
    isItForRental: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);
propertySchema.index({ locationOnMap: "2dsphere" });
function setTheImageUrl(doc) {
  if (doc.property_image) {
    const imageUrl = `${process.env.BASE_URL}/property/${doc.property_image}`;
    doc.property_image = imageUrl;
  }
  if (doc.property_images) {
    let img = [];
    doc.property_images.forEach((image) => {
      const imageURL = `${process.env.BASE_URL}/property/${image}`;
      img.push(imageURL);
    });
    doc.property_images = img;
  }
}
propertySchema.post("init", function (doc) {
  setTheImageUrl(doc);
});
propertySchema.post("save", function (doc) {
  setTheImageUrl(doc);
});
// propertySchema.pre("save", async function (next) {
//   this.property_Number = this.property_Number + generateRandomNumbers();
//   next();
// });
// function generateRandomNumbers() {
//   return Math.floor(1000000 + Math.random() * 9000000);
// }
module.exports = mongoose.model("Property", propertySchema);
