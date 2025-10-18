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
 // search box
router.get("/search",async (req,res)=>{
    const query =req.query.q;
    if (!query) return res.redirect("/listings");
     const allListings = await Listing.find({
        $or:[
            {title :{$regex :query,$options:"i"}},
            {location:{$regex:query,$options:"i"}},
        ],
    });
    res.render("listings/index",{allListings});
});
router.get("/search/suggestions",async(req,res)=>{
    const query =req.query.q;
    if (!query) {
        return res.json([]);
    }
 
    const listings = await Listing.find({
        $or:[
            {title :{$regex :query,$options:"i"}},
            {location:{$regex:query,$options:"i"}},
        ],
    }).limit(5);

    const suggestions = listings.map(I=>({
        title:I.title,
        location:I.title,
    }));
    res.json(suggestions);
});

//new route
router.get("/new", isLoggedIn, listingController.renderNewForm);

router.route("/:id")
.get( wrapAsync(listingController.showListings)) //show route
.put(isLoggedIn,isOwner,upload.single("listing[image]"),validateListing, wrapAsync(listingController.updateListings)) //update route
.delete(isLoggedIn,isOwner, wrapAsync(listingController.deleteListings)); //delete route


//edit route
router.get("/:id/edit",  isLoggedIn,isOwner, wrapAsync(listingController.editListings));

module.exports=router;
