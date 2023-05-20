const asyncHandler = require("express-async-handler");
const { APIError } = require("../Errors/APIError");
require("dotenv").config();
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { sendEmail } = require("../utils/sendEmail");

exports.login = (Model, modelName) =>
  asyncHandler(async (req, res, next) => {
    const document = await Model.findOne({ email: req.body.email });
    if (!document) {
      throw new APIError(
        "there is no user with the given credentials please check your information and try again",
        404
      );
    }
    const IsCorrectPassword = await bcrypt.compare(
      req.body.password,
      document.password
    );
    if (!IsCorrectPassword) {
      throw new APIError("the password isn't correct please try again", 403);
    }
    const token = document.generateJWT();
    res.status(200).json({ [modelName]: document, Token: token });
  });
exports.forgetPassword = (Model) =>
  asyncHandler(async (req, res, next) => {
    const document = await Model.findOne({ email: req.body.email });
    if (!document) {
      throw new APIError(
        "there is no user with the provided email try again with a valid email",
        404
      );
    }

    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();

    const resetCodeHashed = crypto
      .createHash("sha256")
      .update(resetCode)
      .digest("hex");

    document.passwordResetCode = resetCodeHashed;

    document.passwordResetCodeExpirationTime = new Date(
      Date.now() + 60 * 60 * 1000
    ).toISOString();

    document.passwordResetIsVerified = false;
    await document.save();

    const message = `<html>
  <head></head>
  <body>
    
  <h1>HI ${document.name}</h1><hr />
    <p>We have received a request to reset your password for your Account</p>
    <hr />
    ${resetCode}
    <hr />
    enter this code to complete the reset <hr />
    thank you for helping us in keeping your account safe <hr />
    <span>;copy</span><hr />
    <h2>ZamZam Application</h2>
  </body>
    <html /> `;
    try {
      await sendEmail({
        email: document.Email,
        subject: "your password reset code is valid for (1 hour)",
        content: message,
      });
    } catch (error) {
      document.passwordResetCode = undefined;
      document.passwordResetCodeExpirationTime = undefined;
      document.passwordResetIsVerified = undefined;
      await document.save();
      throw new APIError(
        `there was a problem with sending an email 
      please try again or contact us to inform
       us so we can try to solve the problem`,
        500
      );
    }
    res.status(200).json({
      status: "success",
      message: "reset code is sent to the user email",
    });
  });
exports.verifyPasswordResetCode = (Model) =>
  asyncHandler(async (req, res, next) => {
    // 1) get user based on reset code
    const hashedResetCode = crypto
      .createHash("sha256")
      .update(req.body.resetCode)
      .digest("hex");

    const document = await Model.findOne({
      passwordResetCode: hashedResetCode,
      passwordResetCodeExpirationTime: { $gt: Date.now() },
    });

    if (!document) {
      throw new APIError("reset code is expired or invalid", 400);
    }
    // 2)- reset code  is valid
    document.passwordResetIsVerified = true;
    await document.save();
    res.status(200).json({ status: "success" });
  });
exports.resetPassword = (Model) =>
  asyncHandler(async (req, res, next) => {
    //1) get user based on his email
    const document = await Model.findOne({ email: req.body.email });
    if (!document) {
      throw new APIError("there is no such email address try again", 404);
    }
    //2) check the reset code is verified
    if (!document.passwordResetIsVerified) {
      throw new APIError("you did not verify your reset code", 400);
    }
    document.password = req.body.newPassword;
    document.passwordResetCode = undefined;
    document.passwordResetCodeExpirationTime = undefined;
    document.passwordResetIsVerified = undefined;
    await document.save();
    //3) if everything is ok generate new JWT Token
    const token = document.generateJWT();
    res.status(200).json({ jwtToken: token });
  });
exports.signUp = (Model, ModelName) =>
  asyncHandler(async (req, res, next) => {
    const document = await Model.create(req.body);
    if (!document) {
      throw new APIError(
        `the creation of an ${ModelName} is failed try again`,
        500
      );
    }
    const token = document.generateJWT();
    res.status(201).json({ data: document, Token: token });
  });
