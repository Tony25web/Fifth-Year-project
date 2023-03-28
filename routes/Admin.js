const express = require("express");
const router = express.Router();
const AdminController = require("../controllers/Admin");
const auth = require("../controllers/auth");

router
  .route("/guaranteeManager/:managerId")
  .patch(
    auth.verifyJWT,
    auth.AuthorizedTo("admin"),
    AdminController.guaranteeManager
  );
module.exports = router;
