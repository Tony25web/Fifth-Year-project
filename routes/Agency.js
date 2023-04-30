const express = require("express");
const router = express.Router();
const auth = require("../controllers/auth");

const {
  getAgency,
  updateAgency,
  getAgencies,
  deleteAgency,
  removeProperty,
  addProperty,
} = require("../controllers/Agency");

router
  .route("/addProperty")
  .patch(auth.verifyJWT, auth.AuthorizedTo("officeManager"), addProperty);
router
  .route("/removeProperty")
  .delete(auth.verifyJWT, auth.AuthorizedTo("officeManager"), removeProperty);
router.route("/").get(getAgencies);
router.route("/:id").get(getAgency);
router
  .route("/:id")
  .patch(
    auth.verifyJWT,
    auth.AuthorizedTo("admin", "officeManager"),
    updateAgency
  );
router
  .route("/:id")
  .delete(auth.verifyJWT, auth.AuthorizedTo("admin"), deleteAgency);

module.exports = router;
