const express = require("express");
const router = express.Router();
const wrapAsync = require("../Utils/wrapAsync.js");
const ExpressError = require("../Utils/ExpressError.js");
const User  = require("../Models/user.js");
const {  userSchema } = require("../Schema.js");
const passport=require("passport");

const validationUser = (req, res, next) => {
    let { error } = userSchema.validate(req.body);
    if (error) {
      let errormsg = error.details.map((el) => el.message).join(",");
      throw new ExpressError(400, errormsg);
    } else {
      next();
    }
  };

router.get("/signup",async(req,res)=>{
    res.render("users/signup.ejs");
});




router.post("/signup",wrapAsync(async(req,res)=>{
    try{
  let {Username,email,password}=req.body;
    console.log(Username);
    // const newUser=new User({ email, Username});
    const newUser = new User({
        username: req.body.Username,
        email: req.body.email
    });
    console.log(newUser);
    const registeredUser=await User.register(newUser,password);
    console.log(registeredUser);
    req.flash("success","successfully loggedin! ");
    res.redirect("/listings");
    }catch(e){
        req.flash("error", e.message);
        res.redirect("/signup");
    }
}));

router.get("/login",async(req,res)=>{
    res.render("users/login.ejs");
});

router.post("/login",  passport.authenticate('local', { failureRedirect: '/login',failureFlash:true }),wrapAsync(async(req,res)=>{
    req.flash("success","Welcome Back to Home!");
    res.redirect("/listings");
}));




module.exports=router;

