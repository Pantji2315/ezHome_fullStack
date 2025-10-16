const Listing=require("../models/Listing.js");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken=process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken:mapToken});

module.exports.index= async (req,res)=>{
    const allListings= await Listing.find({});
    console.log("Listings found:", allListings.length);
res.render("listings/index.ejs",{allListings});
    };
    module.exports.renderNewForm= (req,res)=>{
        res.render("listings/new.ejs")
    }
    module.exports.showListings=async (req,res)=>{
        let {id}=req.params;
       const  listing= await Listing.findById(id).populate({
        path:"reviews",
        populate:{
        path:"author",
    },
    }).populate("owner");
       if(!listing){
        req.flash("error", "Listing you requested for does not exist!");
         return res.redirect("/listings");
       }
       res.render("listings/show.ejs",{listing})
    };

//     module.exports.createListings=async (req,res,next)=>{
// let url=req.file.path;
// let filename=req.file.filename;

//         const newListing= new Listing(req.body.listing);
//         newListing.owner=req.user._id;
//         newListing.image={url,filename};
//         await newListing.save();
//         req.flash("success", "new listing created");
//         res.redirect("/listings");
  
// };

module.exports.createListings = async (req, res, next) => {
 let response= await geocodingClient.forwardGeocode({
  query:req.body.listing.location,
  limit:1
})
.send()

    
  
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
  
    if (req.file) {
      newListing.image = { url: req.file.path, filename: req.file.filename };
    } else {
      newListing.image = {
        url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
        filename: "default-image"
      };
    }
  newListing.geometry= response.body.features[0].geometry;
     let savedListing=await newListing.save();
     console.log(savedListing);
    req.flash("success", "New listing created!");
    res.redirect("/listings");
  };
  
module.exports.editListings=async  (req,res)=>{
    let {id}= req.params;
    const listing=await Listing.findById(id);
    if(!listing){
        req.flash("error", "Listing you requested for does not exist!");
          return res.redirect("/listings");
       }
       let originalImageUrl=listing.image.url;
       originalImageUrl=originalImageUrl.replace("/upload","/upload/h_300,w_250");

    res.render("listings/edit.ejs", {listing,originalImageUrl});
    
    }
    module.exports.updateListings=async(req,res)=>{
    
        let {id}= req.params;
         let listing =await Listing.findByIdAndUpdate(id, {...req.body.listing})
         if(typeof req.file !== "undefined"){
          let url=req.file.path;
          let filename=req.file.filename;
          listing.image={url,filename};
          await listing.save();
         }
         
         req.flash("success", "listing updated");
         res.redirect(`/listings/${id}`);
    }

    module.exports.deleteListings=async (req,res)=>{
        let {id}=req.params;
        let deletedListing= await  Listing.findByIdAndDelete(id);
        console.log(deletedListing);
        req.flash("success", "listing deleted");
        res.redirect("/listings");
    }