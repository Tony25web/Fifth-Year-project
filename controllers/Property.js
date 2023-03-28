const Property = require("../models/Property");
const asyncHandler = require("express-async-handler");
const { APIError } = require("../Errors/APIError");

const addProperty = asyncHandler(async (req, res, next) => {
  const property = await Property.create({
    user_id: req.user._id,
    typeOfProperty: req.body.type,
    location: req.body.location,
    area: req.body.area,
    room_number: req.body.roomNumber,
    height: req.body.height,
    details: req.body.details,
    price: req.body.price,
    isPropertyAccepted: req.body.isAccepted,
    isItForRental: req.body.isItRental,
  });
  if (!property) {
    throw new APIError("we couldn't add your property try again", 500);
  }
  res.status(201).json({
    status: "success",
    property: property,
  });
});
module.exports = {
  addProperty,
};
