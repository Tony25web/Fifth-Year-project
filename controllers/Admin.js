const asyncHandler = require("express-async-handler");
const Agency = require("../models/Agency");
const { APIError } = require("../Errors/APIError");
const guaranteeManager = asyncHandler(async (req, res, next) => {
  const agent = await Agency.findOneAndUpdate(
    { _id: req.params.managerId },
    { $set: { isAgency: true } }
  );
  if (!agent) {
    throw new APIError(
      "couldn't find an agent with this id : " + req.params.managerId,
      404
    );
  }
  res.status(200).json({ status: "success" });
});
module.exports = {
  guaranteeManager,
};
