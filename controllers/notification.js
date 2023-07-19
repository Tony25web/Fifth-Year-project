const Pusher = require("pusher");
const asyncHandler = require("express-async-handler");
// const AuthenticatePusher = asyncHandler((req, res, next) => {
//   const pusher = new Pusher({
//     app_id: "1610432",
//     key: "86897b3e4efa913dc6d1",
//     secret: "86ad01f9e9a2a5a04d33",
//     cluster: "ap2",});
//   const userId = req.userAuth.data._id;
//   const socketId = uuidv4().replace(/-/g, '');
//   const authenticateUser = pusher.authenticateUser(socketId, userId);
//   return res
//     .status(201)
//     .json({ user: req.userAuth, signature: authenticateUser });
// });

const AuthorizePusher = asyncHandler(async (req, res, next) => {
  const pusher = new Pusher({
    app_id: "1610432",
    key: "86897b3e4efa913dc6d1",
    secret: "86ad01f9e9a2a5a04d33",
    cluster: "ap2",
  });
  const uniqueIdentifier = "c5401f53-df64-43c7-b6c8-9d3db710a238";
  const socketId = `${uniqueIdentifier}`;
  const userId = req.userAuth.data._id;
  const privateChannelName = `private-channel-${userId}`;
  const authData = pusher.authenticateUser(socketId);
  const Auth = pusher.authorizeChannel(socketId, privateChannelName);
  return res.json({ Auth, authData });
});
module.exports = { AuthorizePusher };
