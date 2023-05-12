const express = require("express");
const router = express.Router();
const UserValidator = require("../validation/User");
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

router
  .route("/AllFavorites")
  .get(auth.verifyJWT, auth.AuthorizedTo("user"), getAllFavorites);
router
  .route("/AddFavorite")
  .patch(
    auth.verifyJWT,
    auth.AuthorizedTo("user"),
    UserValidator.addFavorite,
    addFavorite
  );
router
  .route("/deleteFavorite/:id")
  .patch(auth.verifyJWT, auth.AuthorizedTo("user"), deleteFavorite);
router.route("/").get(auth.verifyJWT, auth.AuthorizedTo("admin"), getUsers);
router.route("/:id").get(auth.verifyJWT, auth.AuthorizedTo("admin"), getUser);
router
  .route("/:id")
  .patch(
    auth.verifyJWT,
    auth.AuthorizedTo("user"),
    UserValidator.userUpdate,
    updateUser
  );
router
  .route("/:id")
  .delete(auth.verifyJWT, auth.AuthorizedTo("user"), deleteUser);
module.exports = router;
