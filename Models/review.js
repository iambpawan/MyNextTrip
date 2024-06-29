const { types, number } = require("joi/lib");
const mongoose =require("mongoose");
const { create } = require("./Listing");
const Schema = mongoose.Schema;

const reviewSchema=new Schema({
    comment:String,
    rating:{
        type:Number,
        min:1,
        max:5
    },
    createdAt:{
        type:Date,
        default:Date.now()
    }
});

module.exports=mongoose.model("Review",reviewSchema);
