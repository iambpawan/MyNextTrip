const { error } = require("console");
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsmate = require("ejs-mate");
const session=require("express-session");
// const wrapAsync = require("./Utils/wrapAsync.js");
const flash= require("connect-flash")
const passport=require("passport");
const LocalStrategy=require("passport-local");

const User=require("./Models/user.js");
const ExpressError = require("./Utils/ExpressError.js");


const listenigRouter=require("./routes/listing.js");
const reviewRouter=require("./routes/review.js");
const userRouter=require("./routes/user.js");

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


app.set('trust proxy', 1); // trust first proxy
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie: { 
    exprires: Date.now()+7*24*60*60*1000,
    maxAge: 7*24*60*60*1000,
    httpOnly: true 
    
   }
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use(flash());

app.use((req,res,next)=>{
  res.locals.success=req.flash("success");
  res.locals.error=req.flash("error");
  next();
});

// app.get("/demouser",async(req,res)=>{
//   let fakeUser=new User({
//     email:"studenet@gmail.com",
//     username:"pavan"
//   });
//   let registeredUser=await User.register(fakeUser,"helloworld");
//   res.send(registeredUser);
// })


app.use("/listings",listenigRouter);
app.use("/listings/:id/reviews",reviewRouter);
app.use("/",userRouter);


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
