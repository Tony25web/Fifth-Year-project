const express = require("express");
const router = express.Router();
const auth = require("../controllers/auth");
const { addProperty } = require("../controllers/Property");
router
  .route("/add")
  .post(
    auth.verifyJWT,
    auth.AuthorizedTo("officeManager"),
    auth.isAgency,
    addProperty
  );
module.exports = router;
