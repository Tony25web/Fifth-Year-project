require("dotenv").config();
const bodyParser = require("body-parser");
const express = require("express");
const app = express();
const morgan = require("morgan");
const { connect } = require("./config/connectDataBase");
const PORT = process.env.PORT || 5000;
const authRoute = require("./routes/Auth");
app.use(bodyParser.json());
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
app.use("/api/v1", authRoute);
const server = app.listen(PORT, console.log(`listening to port ${PORT}`));
connect(process.env.MONGO_URI);
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
