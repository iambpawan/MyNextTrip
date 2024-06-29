const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review=require("./review.js");
const listingSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  image: {
    type: String,
    default:
      "https://static.independent.co.uk/2024/01/09/12/FAO_83054_Villa_Mangas_Albufeira_0723_01_RGB-136-DPI-For-Web.jpg?quality=75&width=990&crop=3%3A2%2Csmart&auto=webp",
    set: (v) =>
      v === ""
        ? "https://static.independent.co.uk/2024/01/09/12/FAO_83054_Villa_Mangas_Albufeira_0723_01_RGB-136-DPI-For-Web.jpg?quality=75&width=990&crop=3%3A2%2Csmart&auto=webp"
        : v,
  },
  price: Number,
  location: String,
  country: String,
  reviews: [
    {
      type:Schema.Types.ObjectId,
      ref:"Review",
    },
  ]
});

listingSchema.post("findOneAndDelete",async(listing)=>{
  if(listing){
    await Review.deleteMany({_id: {$in :listing.reviews}});
  }
 
});

const Listing = mongoose.model("listings", listingSchema);
module.exports = Listing;
