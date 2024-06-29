const { error } = require("console");
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsmate = require("ejs-mate");
const wrapAsync = require("./Utils/wrapAsync.js");
const ExpressError = require("./Utils/ExpressError.js");
const { listingSchema,reviewSchema }=require("./Schema.js");
const Listing = require("./Models/Listing.js");
const Review = require("./Models/review.js");

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



const validationListing=(req,res,next)=>{
  let {error}=listingSchema.validate(req.body);
  if(error){
    let errormsg=error.details.map((el)=>el.message).join(",");
    throw new ExpressError(400,errormsg);
  }else{
    next();
  }
}
const validationReview=(req,res,next)=>{
  let {error}=reviewSchema.validate(req.body);
  if(error){
    let errormsg=error.details.map((el)=>el.message).join(",");
    throw new ExpressError(400,errormsg);
  }else{
    next();
  }
}


app.get(
  "/listings",
  wrapAsync(async (req, res) => {
    const allListings = await Listing.find({});
    console.log("data retrived");
    res.render("listings/index.ejs", { allListings });
  })
);

//New Route
app.get("/listings/new", (req, res) => {
  console.log("new list add");
  res.render("listings/new.ejs");
});

app.get(
  "/listings/:id",
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    console.log("get the data of " + id);
    const listing = await Listing.findById(id).populate("reviews");
    console.log("data retrived");
    res.render("listings/show.ejs", { listing });
  })
);

app.post(
  "/listings",validationListing,
  wrapAsync(async (req, res, next) => {
    // let {title,decription,image,price,country,location}=req.body.listing;
   
    const newlisting = new Listing(req.body.listing);
    console.log(newlisting);
    await newlisting.save();
    res.redirect("listings");
  })
);


app.get(
  "/listings/:id/edit",
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    console.log(id);
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs", { listing });
  })
);

app.put(
  "/listings/:id",validationListing,
  wrapAsync(async (req, res) => {
    if(!req.body.listing){
      throw new ExpressError(400,"send valid data for listing");
    }
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    res.redirect(`/listings/${id}`);
  })
);

app.delete(
  "/listings/:id",
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    let deletedlisting = await Listing.findByIdAndDelete(id);
    console.log(deletedlisting);
    res.redirect("/listings");
  })
);
app.post("/listings/:id/reviews",validationReview,
wrapAsync(async(req,res)=>{
  let listing= await Listing.findById(req.params.id);
  let newReview=new Review(req.body.review);

  listing.reviews.push(newReview);
  await newReview.save();
  await listing.save();
  console.log("new review is added");
  res.redirect(`/listings/${listing._id}`);
}));

///listings/<%= listing._id %>/reviews/<%= review.id %>
app.delete(
  "/listings/:id/reviews/:reviewId",
  wrapAsync(async (req, res) => {
    let { id ,reviewId} = req.params;
    await Listing.findByIdAndUpdate(id,{$pull: {reviews:reviewId}});
    await Review.findByIdAndDelete(reviewId);
    console.log(reviewId);
    res.redirect(`/listings/${id}`);
  })
);



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
