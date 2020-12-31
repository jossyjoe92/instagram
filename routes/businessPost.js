const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const BusinessPost = require('../models/businessPost')
const requireLogin = require('../middleware/requireLogin')

//get products or services
router.get('/businesscategory/:category', requireLogin,(req, res) => {
    BusinessPost.find({category:req.params.category})
    .populate('postedBy',"_id name")
    .populate('business',"_id name photo location address")
    .populate('comments.postedBy',"_id name")
    .then(posts=>{
        res.json({posts})
    })
    .catch(err=>{
        console.log(err)
    })
  });

  //get products or services by sub-categories
  router.get('/businesssubcategory/:subcategory', requireLogin,(req, res) => {
    BusinessPost.find({subCategory:req.params.subcategory})
    .populate('postedBy',"_id name")
    .populate('business',"_id name photo location address")
    .populate('comments.postedBy',"_id name")
    .then(posts=>{
        res.json({posts})
    })
    .catch(err=>{
        console.log(err)
    })
  });

  //get my subscribed products or services categories
  router.get('/mysubscribedproductpost/:category', requireLogin,(req, res) => {
    BusinessPost.find({postedBy:{$in:req.user.businessSubscribed},category:req.params.category})
    .populate('postedBy',"_id name")
    .populate('business',"_id name photo")
    .populate('comments.postedBy',"_id name")
    .then(posts=>{
        res.json({posts})
    })
    .catch(err=>{
        console.log(err)
    })
  });
   //get my subscribed products or services sub-categories
   router.get('/mysubscribedproductpost/:subcategory', requireLogin,(req, res) => {
    BusinessPost.find({postedBy:{$in:req.user.businessSubscribed},category:req.params.subcategory})
    .populate('postedBy',"_id name")
    .populate('business',"_id name photo")
    .populate('comments.postedBy',"_id name")
    .then(posts=>{
        res.json({posts})
    })
    .catch(err=>{
        console.log(err)
    })
  });


  //product Search

  router.post('/search/:category',(req,res)=>{
     
    // let userPattern = new RegExp("^"+req.body.query)
     const searchKeyword = req.body.query
     ? {
         title: {
           $regex: req.body.query,
           $options: 'i',
         },
       }
     : {};
     BusinessPost.find( {...searchKeyword,category:req.params.category })
     .select("id title subCategory")
     .then(post=>{
         res.json({post})
     })
     .catch(err=>{
         console.log(err)
     })
 })
 

  //post product or service
router.post('/createbusinesspost',requireLogin,(req,res)=>{

    const {title,category,subCategory,price,description,imgUrl,business} = req.body
    if(!title||!description||!imgUrl||!category||!subCategory){
        return res.status(422).json({error:'Please add all the required fields'})
    }
    //req.user.password = undefined
const businessPost = new BusinessPost({
        title,
        description,
        price,
        category,
        subCategory,
        photo:imgUrl,
        business,
        postedBy:req.user

    })
    businessPost.save()
    .then(result=>{
        res.json({businessPost:result})
    })
    .catch(err=>{
        console.log(err)
    })
})

router.get('/businesspost/:id',requireLogin,(req,res)=>{
    BusinessPost.findOne({_id:req.params.id})
    .populate('postedBy',"_id name photo email")
    .populate('comments.postedBy',"_id name photo")
    .populate('business', "_id email name photo address")
    .then(post=>{
        res.json({post})
    })
    .catch(err=>{
        console.log(err)
    })
})

//all post made by a business
router.get('/allbusinesspost/:Id', requireLogin,(req, res) => {
    BusinessPost.find({business:req.params.Id})
    .populate('business',"_id name photo location address")
    .then(posts=>{
        res.json({posts})
    })
    .catch(err=>{
        console.log(err)
    })
  });

  router.put('/business/comment',requireLogin,(req,res)=>{
    const comment = {
        text:req.body.text,
        postedBy:req.user._id
    }
    BusinessPost.findByIdAndUpdate(req.body.postId,{
        $push:{comments:comment}
    },{
        new:true
    })
    .populate('postedBy',"_id name photo email")
    .populate('comments.postedBy',"_id name photo")
    .populate('business', "_id email name photo address")
    .exec((err,result)=>{
        if(err){
            return res.status(422).json({error:err})
        }else{
            res.json(result)
        }
    })
})

router.put('/business/likepost',requireLogin,(req,res)=>{
    BusinessPost.findByIdAndUpdate(req.body.postId,{
        $push:{likes:req.user._id}
    },{
        new:true
    })
    .populate('postedBy',"_id name photo email")
    .populate('comments.postedBy',"_id name photo")
    .populate('business', "_id email name photo address")
    .exec((err,result)=>{
        if(err){
            return res.status(422).json({error:err})
        }else{
            
            res.json(result)
        }
    })
})

router.put('/business/unlikepost',requireLogin,(req,res)=>{
    BusinessPost.findByIdAndUpdate(req.body.postId,{
        $pull:{likes:req.user._id}
    },{
        new:true
    })
    .populate('postedBy',"_id name photo email")
    .populate('comments.postedBy',"_id name photo")
    .populate('business', "_id email name photo address")
    .exec((err,result)=>{
        if(err){
            return res.status(422).json({error:err})
        }else{
            
            res.json(result)
        }
    })
})

router.delete('/deletebusinesspost/:postId',requireLogin,(req,res)=>{
    BusinessPost.findOne({_id:req.params.postId})
    .populate("postedBy", "_id")
    .exec((err,post)=>{
        if(err||!post){
            return res.status(422).json({error:err})
        }
        if(post.postedBy._id.toString()===req.user._id.toString()){
            post.remove()
            .then(result=>{
                res.json(result)
            }).catch(err=>{
                console.log(err)
            })
        }
    })
})

module.exports = router