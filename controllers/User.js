const asyncHandler = require("express-async-handler");
const { APIError } = require("../Errors/APIError");
const User = require("../models/User");
const Agency = require("../models/Agency");
const { ApiFeatures } = require("../middlewares/apiFeatures");
const { uploadSingleImage } = require("../middlewares/uploadImages");
const sharp = require("sharp");
const { v4: uuidv4 } = require("uuid");
const uploadUserImage = uploadSingleImage("profileImage");
const resizeUserImage = asyncHandler(async (req, res, next) => {
  console.log(req.file);
  if (req.file) {
    const fileNameForCoverImage = `user-${
      req.user.fullName
    }-${uuidv4()}-${Date.now()}.jpeg`;
    await sharp(req.file.buffer)
      .resize(600, 600)
      .toFormat("jpeg")
      .jpeg({ quality: 90 })
      .toFile(`uploads/users/${fileNameForCoverImage}`);
    req.body.profileImage = fileNameForCoverImage;
  }
  next();
});

const getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ _id: req.params.userId });
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
  const transformedData = Object.entries(req.body).filter(
    (entry) => !entry.includes("password")
  );
const updatedData = Object.fromEntries(transformedData)
  const user = await User.findOneAndUpdate({ _id: req.user._id }, updatedData, {
    new: true,
  });
  if (!user) {
    throw new APIError(
      "there is a problem with updating the user or the user is not found",
      404
    );
  }
  res.status(200).json({ user: user, status: "success" });
});
const deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findOneAndRemove({ _id: req.params.id });
  if (!user) {
    throw new APIError("couldn't delete the user", 500);
  }
  res.status(200).json({ status: "success" });
});
const addFavorite = asyncHandler(async (req, res, next) => {
  const userUpdate = await User.findOneAndUpdate(
    { _id: req.user._id },
    { $addToSet: { favorites: req.body.propertyId } },
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
    { _id: req.user._id },
    { favorites: 1, _id: 0 }
  ).populate("favorites");
  if (!favorites) {
    throw new APIError(
      "there is no user with id " +
        req.user.id +
        "or something went wrong with getting user favorites",
      404
    );
  }
  res.status(200).json({ status: "success", Fav: favorites });
});
const deleteFavorite = asyncHandler(async (req, res, next) => {
  const deletedFavorite = await User.findOneAndUpdate(
    { _id: req.user._id },
    { $pull: { favorites: { $in: [req.params.id] } } },
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
const promoteUserToAgency = asyncHandler(async (req, res, next) => {
  const { agencyName, location, agency_License } = req.body;
  console.log(req.user);
  const newAgency = await Agency.create({
    agencyName: agencyName,
    location: location,
    agency_License: agency_License,
    locationOnMap: req.body.locationOnMap,
    email: req.user.email,
    password: req.user.password,
    phoneNumber: req.user.phoneNumber,
  });
  if (!newAgency) {
    throw new APIError(
      `Could not create an new Agency something gone wrong try again`,
      500
    );
  }
  res.json({
    message:
      "your request was registered successfully,We are going to notify you when it is done",
  });
});
module.exports = {
  getUser,
  getUsers,
  updateUser,
  deleteUser,
  addFavorite,
  getAllFavorites,
  deleteFavorite,
  uploadUserImage,
  resizeUserImage,
  promoteUserToAgency,
};
