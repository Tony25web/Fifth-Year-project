const { body } = require("express-validator");
const Agency = require("../models/Agency");
const { validator } = require("../middlewares/validator");
const AddProperty = [
  body("property")
    .notEmpty()
    .withMessage("property must be provided")
    .custom(async (value, { req }) => {
      console.log(req.body);
      const agent = await Agency.findOne({ _id: req.user._id });
      if (agent.properties.indexOf(value) !== -1) {
        return Promise.reject(
          new Error("this property is already present in your agency")
        );
      }
    }),
  validator
];
module.exports = {
  AddProperty,
};
