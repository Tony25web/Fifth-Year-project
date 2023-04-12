const express = require("express");
const router = express.Router();
const auth = require("../controllers/auth");
const { 
  addProperty,
  getAProperty,
  getAllProperties,
  deleteProperty,
  updateProperty,
  resizePropertyImages,
  uploadPropertyImages,
 } = require("../controllers/Property");
const { AddPropertyValidator } = require("../validation/property");
router.route("/all").get(getAllProperties)
router
  .route("/add")
  .post(
    auth.verifyJWT,
    auth.AuthorizedTo("officeManager"),
    auth.isAgency,
    uploadPropertyImages,
    resizePropertyImages,
    AddPropertyValidator,
    addProperty
  );
router.route("/:id").get(getAProperty);
router.route("/:id").patch( auth.verifyJWT,
  auth.AuthorizedTo("officeManager"),updateProperty);
router.route("/:id").delete( auth.verifyJWT,
  auth.AuthorizedTo("officeManager"),deleteProperty);
module.exports = router;
