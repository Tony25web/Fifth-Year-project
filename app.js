require("dotenv").config();
const path = require("path");
const bodyParser = require("body-parser");
const express = require("express");
const cors = require("cors");
const compression = require("compression");
const app = express();
const { Server } = require("socket.io");
const { errorHandler } = require("./utils/errorHandler");
const morgan = require("morgan");
const { connect } = require("./config/connectDataBase");
const PORT = process.env.PORT || 5000;
const authRoute = require("./routes/Auth");
const propertyRoute = require("./routes/Property");
const AdminRouter = require("./routes/Admin");
const userRoute = require("./routes/User");
const agencyRoute = require("./routes/Agency");
app.use(bodyParser.json());
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
app.use(express.static(path.join(__dirname, "uploads")));
// Cross Origin Resource Sharing configuration
app.use(cors());
//compress all response
app.use(compression());
app.options("*", cors());
app.use("/api/v1", authRoute);
app.use("/api/v1/users", userRoute);
app.use("/api/v1/agency", agencyRoute);
app.use("/api/v1/property", propertyRoute);
app.use("/api/v1/admin", AdminRouter);
app.use(errorHandler);
const server = app.listen(PORT, console.log(`listening to port ${PORT}`));
connect(process.env.MONGO_URI);
const io = new Server(server);
io.on("connection", (socket) => {
  console.log("a user is connected");
  console.log(socket);
});
/* we are going to use the events in nodejs 
  to handle errors that can't be handled by express
  */
process.on("unhandledRejection", (err) => {
  console.error(`unhandledRejection Errors:${err.name}| ${err.message} `);
  /*
     when we have pending requests or active requests that are in the server
     we are going to wait the server to finish them and then we are going
      to close the server and finally we exit the process 
     =>*/
  server.close(() => {
    console.log("the server is shutting down....");
    process.exit(1);
  });
});
