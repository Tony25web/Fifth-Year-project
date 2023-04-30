const Agency = require("../models/Agency");
const mongoose = require("mongoose");
const asyncHandler = require("express-async-handler");
const { APIError } = require("../Errors/APIError");
const { ApiFeatures } = require("../middlewares/apiFeatures");
const getAgency = asyncHandler(async (req, res, next) => {
  const agency = await Agency.findById(req.params.id);
  if (!agency) {
    throw new APIError("there is no agency with id " + req.params.id, 404);
  }
  res.status(200).json(agency);
});
const getAgencies = asyncHandler(async (req, res, next) => {
  const documentCounts = await Agency.countDocuments();
  const apiFeatures = new ApiFeatures(Agency.find({}), req.query)
    .pagination(documentCounts)
    .sort();
  const { MongooseQuery, PaginationResult } = apiFeatures;
  const agencies = await MongooseQuery;
  if (!agencies) {
    throw new APIError("there is no agencies yet", 404);
  }
  res.status(200).json({
    Agencies: agencies,
    result: agencies.length,
    pagination: PaginationResult,
  });
});
const updateAgency = asyncHandler(async (req, res, next) => {
  const agency = await Agency.findOneAndUpdate(
    { _id: req.params.id },
    req.body,
    { new: true }
  );
  if (!agency) {
    throw new APIError(
      "there is no agency to update with the id " + req.params.agencyId,
      404
    );
  }
  res.status(200).json({ agency: agency });
});
const deleteAgency = asyncHandler(async (req, res, next) => {
  const agency = await Agency.findOneAndDelete({ _id: req.params.id });
  if (!agency) {
    throw new APIError(
      "there is no agency with the provided id to delete",
      404
    );
  }
  res.status(200).json({ status: "success" });
});
const removeProperty = asyncHandler(async (req, res, next) => {
  console.log(req.body.properties);
  const removedProperty = await Agency.findOneAndUpdate(
    { _id: req.user._id },
    { $pull: { properties:{$in:[...req.body.properties]} } },
    { new: true }
  );
  if (!removedProperty) {
    throw new APIError(
      "either the property is already removed or something else went wrong",
      404
    );
  }
  res.status(200).json({ agency: removedProperty, status: "success" });
});
const addProperty = asyncHandler(async (req, res, next) => {
  const updateAgency = await Agency.findByIdAndUpdate(
    { _id: req.user._id },
    {
      $addToSet: {
        properties: mongoose.Types.ObjectId(req.body.properties),
      },
    },
    { new: true }
  );
  if (!updateAgency) {
    throw new APIError(
      "couldn't update the agency's properties due to an error either the property isn't found or something else",
      404
    );
  }
  res.status(200).json({ Agency: updateAgency, status: "success" });
});
const modifyPropertiesToOjectId = asyncHandler(async (req, res, next) => {
  let newPropertiesId = [];
  const { properties } = req.body.properties;
  properties.map((property) => {
    newPropertiesId.push(mongoose.Types.ObjectId(property));
  });
  req.body.properties = newPropertiesId;
  next();
});
module.exports = {
  getAgency,
  updateAgency,
  getAgencies,
  deleteAgency,
  removeProperty,
  addProperty,
  modifyPropertiesToOjectId,
};
