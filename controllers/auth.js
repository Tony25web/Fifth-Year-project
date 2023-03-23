const User = require("../models/User");
const crypto = require("crypto");
const Agency = require("../models/Agency");
const bcrypt = require("bcryptjs");
const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const { APIError } = require("../Errors/APIError");
const { sendEmail } = require("../utils/sendEmail");
require("dotenv").config();
const signUpForUser = asyncHandler(async (req, res, next) => {
  const user = await User.create({
    fullName: req.body.fullName,
    Email: req.body.email,
    password: req.body.password,
    phoneNumber: req.body.phoneNumber,
  });
  if (!user) {
    throw new APIError("the creation of a user is failed try again", 500);
  }
  const token = user.generateJWT();

  res.status(201).json({ data: user, Token: token });
});

const signUpForAgency = asyncHandler(async (req, res, next) => {
  const agency = await Agency.create({
    Email: req.body.email,
    password: req.body.password,
    role: req.body.role,
    agencyName: req.body.agencyName,
    location: {
      type:req.body.location.type,
      coordinates: req.body.location.coordinates,
    },
    agencyPhoneNumber: req.body.phoneNumber,
    agency_License: req.body.agencyLicense,
  });
  if (!agency) {
    throw new APIError("the creation of an agency is failed try again", 500);
  }
  const token = agency.generateJWT();
  res.status(201).json({ data: agency, Token: token });
});

const loginForUser = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ Email: req.body.email });
  if (!user) {
    throw new APIError(
      "there is no user with the given credentials please check your information and try again",
      404
    );
  }
  const IsCorrectPassword = await bcrypt.compare(
    req.body.password,
    user.password
  );
  if (!IsCorrectPassword) {
    throw new APIError("the password isn't correct please try again", 403);
  }
  const token = user.generateJWT();
  res.status(200).json({ User: user, Token: token });
});
const loginForAgency = asyncHandler(async (req, res, next) => {
  const agent = await Agency.findOne({ Email: req.body.email });
  if (!agent) {
    throw new APIError(
      "there is no user with the given credentials please check your information and try again",
      404
    );
  }

  const IsCorrectPassword = await bcrypt.compare(
    req.body.password,
    agent.password
  );
  if (!IsCorrectPassword) {
    throw new APIError("the password isn't correct please try again", 403);
  }
  const token = agent.generateJWT();
  res.status(200).json({ agency: agent, Token: token });
});

const AuthorizedTo = (...roles) =>
  asyncHandler(async (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new APIError("you are not allowed to access this location", 403);
    }
    next();
  });

const verifyJWT = asyncHandler(async (req, res, next) => {
  const authorizationHeader = req.headers.authorization;
  if (!authorizationHeader || !authorizationHeader.startWith("Bearer")) {
    throw new APIError("please check if you are logged in and try again", 401);
  }
  const token = authorizationHeader.split(" ")[1];

  let decodedToken = jwt.verify(token.process.env.JWT_SECRET);

  const user = await User.findOne({ _id: decodedToken.userId, active: true });
  if (!user) {
    throw new APIError(
      "this account does not exist any more or deactivated try to activate the account or signup again"
    );
  }
  if (user.PasswordChangedAt) {
    /*we have in the payload that we received from verifying our 
        token a property called (iat) it has the expiration date 
        for the token so we gonna check it against our passwordChangeAt property */
    const passwordChangedTimeStamp = parseInt(
      user.PasswordChangedAt.getTime() / 1000,
      10
    );
    if (passwordChangedTimeStamp > decodedToken.iat) {
      throw new APIError(
        "the password has been changed since the last login please login again",
        401
      );
    }
  }
  req.user = user;
  next();
});

const forgetPasswordForUser = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
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

  user.passwordResetCode = resetCodeHashed;

  user.passwordResetCodeExpirationTime = new Date(
    Date.now() + 60 * 60 * 1000
  ).toISOString();

  user.passwordResetIsVerified = false;
  await user.save();

  const message = `<html>
  <head></head>
  <body>
    
  <h1>HI ${user.name}</h1><hr />
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
      email: user.Email,
      subject: "your password reset code is valid for (1 hour)",
      content: message,
    });
  } catch (error) {
    user.passwordResetCode = undefined;
    user.passwordResetCodeExpirationTime = undefined;
    user.passwordResetIsVerified = undefined;
    await user.save();
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
const forgetPasswordForAgency = asyncHandler(async (req, res, next) => {
  const agent = await Agency.findOne({ email: req.body.email });
  if (!agent) {
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

  agent.passwordResetCode = resetCodeHashed;

  agent.passwordResetCodeExpirationTime = new Date(
    Date.now() + 60 * 60 * 1000
  ).toISOString();

  agent.passwordResetIsVerified = false;
  await agent.save();

  const message = `<html>
  <head></head>
  <body>
    
  <h1>HI ${agent.name}</h1><hr />
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
      email: agent.Email,
      subject: "your password reset code is valid for (1 hour)",
      content: message,
    });
  } catch (error) {
    agent.passwordResetCode = undefined;
    agent.passwordResetCodeExpirationTime = undefined;
    agent.passwordResetIsVerified = undefined;
    await agent.save();
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

const verifyResetCodeForUser = asyncHandler(async (req, res, next) => {
  // 1) get user based on reset code
  const hashedResetCode = crypto
    .createHash("sha256")
    .update(req.body.resetCode)
    .digest("hex");

  const user = await User.findOne({
    passwordResetCode: hashedResetCode,
    passwordResetCodeExpirationTime: { $gt: Date.now() },
  });

  if (!user) {
    throw new APIError("reset code is expired or invalid", 400);
  }
  // 2)- reset code  is valid
  user.passwordResetIsVerified = true;
  await user.save();
  res.status(200).json({ status: "success" });
});
const verifyResetCodeForAgency = asyncHandler(async (req, res, next) => {
  // 1) get user based on reset code
  const hashedResetCode = crypto
    .createHash("sha256")
    .update(req.body.resetCode)
    .digest("hex");

  const user = await User.findOne({
    passwordResetCode: hashedResetCode,
    passwordResetCodeExpirationTime: { $gt: Date.now() },
  });

  if (!user) {
    throw new APIError("reset code is expired or invalid", 400);
  }
  // 2)- reset code  is valid
  user.passwordResetIsVerified = true;
  await user.save();
  res.status(200).json({ status: "success" });
});

const resetPasswordForUser = asyncHandler(async (req, res, next) => {
  //1) get user based on his email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    throw new APIError("there is no such email address try again", 404);
  }
  //2) check the reset code is verified
  if (!user.passwordResetIsVerified) {
    throw new APIError("you did not verify your reset code", 400);
  }
  user.password = req.body.newPassword;
  user.passwordResetCode = undefined;
  user.passwordResetCodeExpirationTime = undefined;
  user.passwordResetIsVerified = undefined;
  await user.save();
  //3) if everything is ok generate new JWT Token
  const token = user.generateJWT();
  res.status(200).json({ jwtToken: token });
});
const resetPasswordForAgency = asyncHandler(async (req, res, next) => {
  //1) get user based on his email
  const agent = await Agency.findOne({ email: req.body.email });
  if (!agent) {
    throw new APIError("there is no such email address try again", 404);
  }
  //2) check the reset code is verified
  if (!agent.passwordResetIsVerified) {
    throw new APIError("you did not verify your reset code", 400);
  }
  agent.password = req.body.newPassword;
  agent.passwordResetCode = undefined;
  agent.passwordResetCodeExpirationTime = undefined;
  agent.passwordResetIsVerified = undefined;
  await agent.save();
  //3) if everything is ok generate new JWT Token
  const token = agent.generateJWT();
  res.status(200).json({ jwtToken: token });
});
module.exports = {
  loginForAgency,
  loginForUser,
  resetPasswordForUser,
  resetPasswordForAgency,
  verifyResetCodeForAgency,
  verifyResetCodeForUser,
  signUpForAgency,
  signUpForUser,
  AuthorizedTo,
  verifyJWT,
  forgetPasswordForUser,
  forgetPasswordForAgency,
};
