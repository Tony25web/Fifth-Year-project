const { body } = require("express-validator");
const Property = require("../models/Property");
const { validator } = require("../middlewares/validator");
const AddPropertyValidator = [
  body("type").notEmpty().withMessage("the type of the property is required"),
  body("location")
    .notEmpty()
    .withMessage("the location of the property is required"),
  body("roomNumber")
    .notEmpty()
    .withMessage("the number of rooms of  the property is required")
    .isNumeric()
    .withMessage("the number of rooms of the property must be a number"),
  body("area")
    .notEmpty()
    .withMessage("the area of the property is required")
    .isNumeric()
    .withMessage("the number of rooms of the property must be a number"),
  body("height")
    .notEmpty()
    .withMessage("the height of the property is required"),
  body("details")
    .notEmpty()
    .withMessage("the details of the property is required"),
  body("price")
    .notEmpty()
    .withMessage("the price of the property is required")
    .isNumeric()
    .withMessage("the price of the property must be a number "),
  body("propertyNumber")
    .notEmpty()
    .withMessage("the Number of the property is required")
    .isNumeric()
    .withMessage("the Number of the property must be a number")
    .custom(async (value, { req }) => {
      const propertyExists = await Property.findOne({
        propertyNumber: value,
        realEstateArea: req.body.estateArea,
      });
      if (propertyExists) {
        return Promise.reject(
          new Error("this property is added before try again")
        );
      }
    }),
  body("estateArea")
    .notEmpty()
    .withMessage(
      "the real Estate area that the property belongs to is required"
    ),
  validator,
];
module.exports = {
  AddPropertyValidator,
};
