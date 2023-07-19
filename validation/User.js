const { body, param } = require("express-validator");
const User = require("../models/User");
const { validator } = require("../middlewares/validator");
const addFavorite = [
  body("propertyId")
    .notEmpty()
    .withMessage("the property must be provided")
    .isMongoId()
    .withMessage("this must be of specific type"),
  body("userId").custom(async (value, { req }) => {
    const user = await User.findOne({ _id: value });
    if (user.favorites.indexOf(req.body.propertyId) !== -1) {
      return Promise.reject(
        new Error(
          "this property is already in the favorites please try another one"
        )
      );
    }
    if (user._id.toString() !== req.user._id.toString()) {
      return Promise.reject(
        new Error(
          "you are not the owner of this account so you are not allowed to do this "
        )
      );
    }
  }),
  validator,
];
const userUpdate = [
  param("id")
    .isMongoId()
    .withMessage("this no valid id")
    .custom(async (value, { req }) => {
      const user = await User.findOne({ _id: value });
      if (user._id.toString() !== req.user._id.toString()) {
        return Promise.reject(
          new Error(
            "you are not the owner of this account so you are not allowed to do this "
          )
        );
      }
    }),
  validator,
];
module.exports = { addFavorite, userUpdate };
