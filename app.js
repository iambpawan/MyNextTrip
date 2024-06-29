const { error } = require("console");
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsmate = require("ejs-mate");
// const wrapAsync = require("./Utils/wrapAsync.js");
const ExpressError = require("./Utils/ExpressError.js");

const listenings=require("./routes/listing.js");
const reviews=require("./routes/review.js");

const MONGO_URL = "mongodb://localhost:27017/mynexttrip";

main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log("connection to DB failed " + err);
  });

async function main() {
  await mongoose.connect(MONGO_URL);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "Views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsmate);
app.use(express.static(path.join(__dirname, "/Public")));

// function asyncWrap(fn){
//   return function(req,res,next){
//     fn(req,res,next).catch((err)=>next(err));
//   }
// }
app.get("/", (req, res) => {
  res.send("working ");
});


app.use("/listings",listenings);
app.use("/listings/:id/reviews",reviews)



app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page not found!"));
});

app.use((err, req, res, next) => {
  let { statusCode = 500, message = "unknown error default" } = err;
  // let {statusCode,message}=err;
  console.log(err);
  res.status(statusCode).render("error.ejs",{message});
  // res.status(statusCode).send(message);
});

app.listen(8000, () => {
  console.log("listening on port 8000");
});
