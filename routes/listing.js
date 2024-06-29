const express = require("express");
const router = express.Router();
const wrapAsync = require("../Utils/wrapAsync.js");
const Listing = require("../Models/Listing.js");
const ExpressError = require("../Utils/ExpressError.js");
const { listingSchema } = require("../Schema.js");

const validationListing = (req, res, next) => {
  let { error } = listingSchema.validate(req.body);
  if (error) {
    let errormsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errormsg);
  } else {
    next();
  }
};

router.get(
  "/",
  wrapAsync(async (req, res) => {
    const allListings = await Listing.find({});
    console.log("data retrived");
    res.render("listings/index.ejs", { allListings });
  })
);

//New Route
router.get("/new", (req, res) => {
  console.log("new list add");
  res.render("listings/new.ejs");
});

router.get(
  "/:id",
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    console.log("get the data of " + id);
    const listing = await Listing.findById(id).populate("reviews");
    console.log("data retrived");
    res.render("listings/show.ejs", { listing });
  })
);

router.post(
  "/",
  validationListing,
  wrapAsync(async (req, res, next) => {
    // let {title,decription,image,price,country,location}=req.body.listing;
    const newlisting = new Listing(req.body.listing);
    console.log(newlisting);
    await newlisting.save();
    res.redirect("listings");
  })
);

router.get(
  "/:id/edit",
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    console.log(id);
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs", { listing });
  })
);

router.put(
  "/:id",
  validationListing,
  wrapAsync(async (req, res) => {
    if (!req.body.listing) {
      throw new ExpressError(400, "send valid data for listing");
    }
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    res.redirect(`/listings/${id}`);
  })
);

router.delete(
  "/:id",
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    let deletedlisting = await Listing.findByIdAndDelete(id);
    console.log(deletedlisting);
    res.redirect("/listings");
  })
);


module.exports=router;