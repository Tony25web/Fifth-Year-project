const express = require("express");
const router = express.Router();
const AuthValidator = require("../validation/Auth");
const {
  loginForAgency,
  loginForUser,
  resetPasswordForUser,
  resetPasswordForAgency,
  verifyResetCodeForAgency,
  verifyResetCodeForUser,
  signUpForAgency,
  signUpForUser,
  forgetPasswordForUser,
  forgetPasswordForAgency,
} = require("../controllers/auth");
router
  .route("/user/signup")
  .post(AuthValidator.UserSignUpValidation, signUpForUser);
router.route("/user/login").post(loginForUser);
router.route("/user/resetPassword").post(resetPasswordForUser);
router.route("/user/verifyResetCode").post(verifyResetCodeForUser);
router.route("/user/forgetPassword").post(forgetPasswordForUser);
router
  .route("/agency/signup")
  .post(AuthValidator.AgencySignUpValidation, signUpForAgency);
router.route("/agency/login").post(loginForAgency);
router.route("/agency/resetPassword").post(resetPasswordForAgency);
router.route("/agency/verifyResetCode").post(verifyResetCodeForAgency);
router.route("/agency/forgetPassword").post(forgetPasswordForAgency);

module.exports = router;
