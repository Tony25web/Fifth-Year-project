const User = require("../models/User");
const Agency = require("../models/Agency");
const authFactory = require("./authFactory");
const asyncHandler = require("express-async-handler");
const { APIError } = require("../Errors/APIError");
require("dotenv").config();
const jwt = require("jsonwebtoken");

const signUpForUser = authFactory.signUp(User, "User");

const signUpForAgency = authFactory.signUp(Agency, "Agency");

const loginForUser = authFactory.login(User, "User");

const loginForAgency = authFactory.login(Agency, "Agency");

const forgetPasswordForUser = authFactory.forgetPassword(User);

const forgetPasswordForAgency = authFactory.forgetPassword(Agency);

const verifyResetCodeForUser = authFactory.verifyPasswordResetCode(User);

const verifyResetCodeForAgency = authFactory.verifyPasswordResetCode(Agency);

const resetPasswordForUser = authFactory.verifyPasswordResetCode(User);

const resetPasswordForAgency = authFactory.verifyPasswordResetCode(Agency);

const AuthorizedTo = (...roles) =>
  asyncHandler(async (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new APIError("you are not allowed to access this route", 403);
    }
    next();
  });

const verifyJWT = asyncHandler(async (req, res, next) => {
  const authorizationHeader = req.headers.authorization;
  if (!authorizationHeader || !authorizationHeader.startsWith("Bearer")) {
    throw new APIError("please check if you are logged in and try again", 401);
  }
  const token = authorizationHeader.split(" ")[1];

  let decodedToken = jwt.verify(token, process.env.JWT_SECRET);

  const [user, agent] = await Promise.allSettled([
    User.findOne({ _id: decodedToken.user_id }),
    Agency.findOne({ _id: decodedToken.user_id }),
  ]);

  if (!user && !agent) {
    throw new APIError(
      "this account does not exist any more try to signup again"
    );
  }
  const userOrAgent = user || agent;
  if (userOrAgent.PasswordChangedAt) {
    /*we have in the payload that we received from verifying our 
        token a property called (iat) it has the expiration date 
        for the token so we gonna check it against our passwordChangeAt property */
    const passwordChangedTimeStamp = parseInt(
      userOrAgent.PasswordChangedAt.getTime() / 1000,
      10
    );
    if (passwordChangedTimeStamp > decodedToken.iat) {
      throw new APIError(
        "the password has been changed since the last login please login again",
        401
      );
    }
  }
  if (user.status === "fulfilled" && user.value !== null) {
    req.user = user.value;
  } else {
    req.user = agent.value;
  }
  next();
});

const isAgency = asyncHandler((req, res, next) => {
  if (!req.user.isAgency) {
    throw new APIError(
      "you cannot preform this action until you become a Office Manager",
      403
    );
  }
  next();
});
module.exports = {
  isAgency,
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
