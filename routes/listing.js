const express=require("express");
const router=express.Router();
const wrapAsync=require("../utils/wrapAsync.js");
const Listing=require("../models/Listing.js");
const listingController= require("../controllers/listings.js");

const{isLoggedIn,isOwner,validateListing}=require("../middleware.js");
const multer  = require('multer')
const {storage}=require("../cloudconfig.js");
const upload = multer({ storage })



router.route("/")
.get( wrapAsync(listingController.index))  //index route
.post( isLoggedIn,upload.single("listing[image]"), validateListing ,wrapAsync(listingController.createListings)) //create route


//new route
router.get("/new", isLoggedIn, listingController.renderNewForm);

router.route("/:id")
.get( wrapAsync(listingController.showListings)) //show route
.put(isLoggedIn,isOwner,upload.single("listing[image]"),validateListing, wrapAsync(listingController.updateListings)) //update route
.delete(isLoggedIn,isOwner, wrapAsync(listingController.deleteListings)); //delete route


//edit route
router.get("/:id/edit",  isLoggedIn,isOwner, wrapAsync(listingController.editListings));

module.exports=router;