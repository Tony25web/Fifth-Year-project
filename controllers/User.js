const asyncHandler = require("express-async-handler");
const { APIError } = require("../Errors/APIError");
const User = require("../models/User");
const { ApiFeatures } = require("../middlewares/apiFeatures");

const getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ id: req.params.userId });
  if (!user) {
    throw new APIError("User not found", 404);
  }
  res.status(200).json({ user: user });
});
const getUsers = asyncHandler(async (req, res, next) => {
  const documentCount = await User.countDocuments();
  const apiFeatures = new ApiFeatures(User.find(), req.query).pagination(
    documentCount
  );
  const { PaginationResult, MongooseQuery } = apiFeatures;
  const users = await MongooseQuery;
  if (!users) {
    throw new APIError("there is no users yet", 404);
  }
  res.status(200).json({
    result: users.length,
    Users: users,
    pagination: PaginationResult,
  });
});
const updateUser = asyncHandler(async (req, res, next) => {
  const user = await User.findOneAndUpdate(
    { _id: req.params.userId },
    req.body,
    {
      new: true,
    }
  );
  if (!user) {
    throw new APIError(
      "there is a problem with updating the user or the user is not found",
      404
    );
  }
  res.status(200).json({ user: user, status: "success" });
});
const deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findOneAndRemove(
    { _id: req.params.userId },
    req.body,
    {
      new: true,
    }
  );
  if (!user) {
    throw new APIError("couldn't delete the user", 500);
  }
  res.status(200).json({ status: "success" });
});
const addFavorite = asyncHandler(async (req, res, next) => {
  const userUpdate = await User.findOneAndUpdate(
    { _id: req.user.userId },
    { $addToSet: { favorites: [req.body.favorite] } },
    { new: true }
  );
  if (!userUpdate) {
    throw new APIError(
      "there is no user with id " +
        req.user.id +
        "or something went wrong with the operation",
      404
    );
  }
  res.status(200).json({ status: "success" });
});
const getAllFavorites = asyncHandler(async (req, res, next) => {
  const favorites = await User.find(
    { _id: req.user.userId },
    { favorites: 1, id: 0 }
  );
  if (!favorites) {
    throw new APIError(
      "there is no user with id " +
        req.user.id +
        "or something went wrong with getting user favorites",
      404
    );
  }
  res.status(200).json({ status: "success", Favorites: favorites });
});
const deleteFavorite = asyncHandler(async (req, res, next) => {
  const deletedFavorite = await User.findOneAndUpdate(
    { _id: req.user.userId },
    { $pull: { favorites: req.body.favorite } },
    { new: true }
  );
  if (!deletedFavorite) {
    throw new APIError(
      "there is no user with id " +
        req.user.id +
        "or something went wrong with deleting the user's favorite property",
      404
    );
  }
  res.status(200).json({ status: "success", Favorites: deletedFavorite });
});
module.exports = {
  getUser,
  getUsers,
  updateUser,
  deleteUser,
  addFavorite,
  getAllFavorites,
  deleteFavorite,
};
