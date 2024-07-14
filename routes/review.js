const express = require("express");
const router = express.Router({mergeParams:true});
const wrapAsync = require("../Utils/wrapAsync.js");
const Listing = require("../Models/Listing.js");
const ExpressError = require("../Utils/ExpressError.js");
const {  reviewSchema } = require("../Schema.js");
const Review = require("../Models/review.js");

const validationReview = (req, res, next) => {
  let { error } = reviewSchema.validate(req.body);
  if (error) {
    let errormsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errormsg);
  } else {
    next();
  }
};

router.post(
  "/",
  validationReview,
  wrapAsync(async (req, res) => {
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);

    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();
    console.log("new review is added");
    req.flash("success","Review is Added!");
    res.redirect(`/listings/${listing._id}`);
  })
);

///listings/<%= listing._id %>/reviews/<%= review.id %>
router.delete(
  "/:reviewId",
  wrapAsync(async (req, res) => {
    let { id, reviewId } = req.params;
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    console.log(reviewId);
    req.flash("success","Review deleted !");
    res.redirect(`/listings/${id}`);
  })
);


module.exports=router;