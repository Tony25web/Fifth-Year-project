const express = require("express");
const router = express.Router();
const auth = require("../controllers/auth");
const AgencyValidator = require("../validation/Agency");
const {
  getAgency,
  updateAgency,
  getAgencies,
  deleteAgency,
  removeProperty,
  addProperty,
  uploadAgencyImage,
  resizeAgencyImage,
  getAgencyProperties,
} = require("../controllers/Agency");

router
  .route("/addProperty")
  .patch(
    auth.verifyJWT,
    AgencyValidator.AddProperty,
    auth.AuthorizedTo("officeManager"),
    addProperty
  );
router
  .route("/removeProperty")
  .delete(auth.verifyJWT, auth.AuthorizedTo("officeManager"), removeProperty);
router
  .route("/properties")
  .get(auth.verifyJWT, auth.AuthorizedTo("officeManager"), getAgencyProperties);
router.route("/").get(getAgencies);
router.route("/:id").get(getAgency);
router
  .route("/:id")
  .patch(
    auth.verifyJWT,
    auth.AuthorizedTo("admin", "officeManager"),
    uploadAgencyImage,
    resizeAgencyImage,
    updateAgency
  );
router
  .route("/:id")
  .delete(auth.verifyJWT, auth.AuthorizedTo("admin"), deleteAgency);
router.route("/forgetPassword").post(auth.forgetPasswordForAgency);
router.route("/verifyResetCode").post(auth.verifyResetCodeForAgency);
router.route("/resetPassword").post(auth.resetPasswordForAgency);
module.exports = router;
