const express = require("express");
const router = express.Router();
const auth = require("../controllers/auth");
const {
  getUser,
  getUsers,
  updateUser,
  deleteUser,
  addFavorite,
  getAllFavorites,
  deleteFavorite,
} = require("../controllers/User");

router.route("/").get(auth.verifyJWT, auth.AuthorizedTo("admin"), getUsers);
router.route("/:id").get(auth.verifyJWT, auth.AuthorizedTo("admin"), getUser);
router
  .route("/:id")
  .patch(auth.verifyJWT, auth.AuthorizedTo("admin"), updateUser);
router
  .route("/:id")
  .delete(auth.verifyJWT, auth.AuthorizedTo("admin"), deleteUser);
router
  .route("/AllFavorites")
  .get(auth.verifyJWT, auth.AuthorizedTo("user"), getAllFavorites);
router
  .route("/AddFavorite")
  .patch(auth.verifyJWT, auth.AuthorizedTo("user"), addFavorite);
router
  .route("/deleteFavorite/:id")
  .patch(auth.verifyJWT, auth.AuthorizedTo("user"), deleteFavorite);
module.exports = router;
