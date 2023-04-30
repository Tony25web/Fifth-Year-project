const { body } = require("express-validator");
const slugify = require("slugify");
const User = require("../models/User");
const { validator } = require("../middlewares/validator");
const UserSignUpValidation = [
  body("fullName")
    .notEmpty()
    .withMessage("this field should not be empty")
    .isLength({ min: 3, max: 45 })
    .withMessage("your name should not exceeds 45 character")
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    })
    .custom(async (val, { req }) => {
      await User.findOne({ fullName: val }).then((user) => {
        if (user) {
          return Promise.reject(new Error("this name is already in use"));
        }
      });
    }),
  body("email")
    .isEmail()
    .withMessage("you should insert a valid email")
    .notEmpty()
    .withMessage("User's email is required")
    .custom(async (value, { req }) => {
      const user = await User.findOne({ Email: value });
      if (user) {
        return Promise.reject(
          new Error(`this email address already exist try another email`)
        );
      }
    }),
  body("password")
    .notEmpty()
    .withMessage("User's password is required")
    .isLength({ min: 6 })
    .withMessage("the password must be at least 6 characters"),
  body("phoneNumber")
    .notEmpty()
    .withMessage("the phone number is required")
    .isMobilePhone(["ar-SY"])
    .withMessage("invalid phone number only valid from :syria "),
  validator,
];
const AgencySignUpValidation = [
  body("email")
    .isEmail()
    .withMessage("you should insert a valid email")
    .notEmpty()
    .withMessage("User's email is required")
    .normalizeEmail(),
  body("password")
    .notEmpty()
    .withMessage("User's password is required")
    .isLength({ min: 6 })
    .withMessage("the password must be at least 6 characters"),
  body("phoneNumber")
    .notEmpty()
    .withMessage("the phone number is required")
    .isMobilePhone(["ar-SY"])
    .withMessage("invalid phone number only valid from :syria "),
  body("agencyName")
    .notEmpty()
    .withMessage("the agency must have a name please provide a one")
    .isLength({ min: 3 })
    .withMessage("the agency name must be at least 3 characters"),
  body("agency_License")
    .notEmpty()
    .withMessage("any agency must have a license"),
  body("location")
    .notEmpty()
    .withMessage("the location must be provided")
,
  body("locationOnMap").optional(),
  validator,
];
module.exports = { UserSignUpValidation, AgencySignUpValidation };
