const mongoose = require("mongoose");
mongoose.set("strictQuery", false);
const connect =  (URL)=>{
  return mongoose
    .connect(URL)
    .then(() => {
      return console.log("Connected to Database");
    })
    .catch((err) => {
      console.log(err);
      process.exit(1);
    });
};
module.exports={connect}
