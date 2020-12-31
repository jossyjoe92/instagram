const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const User = require('../models/user')
const BusinessPost = require('../models/businessPost')
const Business = require('../models/business')

const requireLogin = require('../middleware/requireLogin')

//Register a new Business

router.post('/business/newbusiness',requireLogin,(req,res)=>{

   
    const {name,email,location,address,description,phone,imgUrl,coverVideo} = req.body
    if(!name||!email||!location||!address||!phone){
        return res.status(422).json({error:'Please add all the fields'})
    }
   //req.user.password = undefined
    const business = new Business({
        name,
        email,
        location,
        address,
        description,
        phone,
        coverVideo,
        photo:imgUrl,
        

    })
    business.save()
    .then(result=>{
        User.findByIdAndUpdate(req.user._id,{
            $set:{businessRegistered:result}
        },{
            new:true
        })
        .then(result=>{
            res.json({result,message:'Business saved Successfully'})
        })

       .catch(err=>{
        console.log(err)
        })
    })
    .catch(err=>{
        console.log(err)
    })
})
router.put('/business/updatebusiness',requireLogin,(req,res)=>{
    
    const {name,email,location,address,description,phone,imgUrl,coverVideo} = req.body
    if(!name||!email||!location||!address||!phone){
        return res.status(422).json({error:'Please add all the fields'})
    }
    Business.findByIdAndUpdate(req.user.businessRegistered,req.body,{
        new:true
    })
    .then(result=>{
        res.json({result,message:'Business updated Successfully'})
    })

   .catch(err=>{
    console.log(err)
    })
})
router.get('/business/:id',requireLogin,(req,res)=>{
    Business.findOne({_id:req.params.id})
    .then(business=>{
        BusinessPost.find({business:req.params.id})
        .populate('business',"_id name photo location address")
        .populate("postedBy", "_id name")
        .exec((err,posts)=>{
            if(err){
                return res.status(422).json({error:err})
            }
            res.json({business,posts})
        })
    })
    .catch(err=>{
        return res.status(404).json({error:"Business not found"})
    })
})


router.put('/subscribe',requireLogin,(req,res)=>{
   
    Business.findByIdAndUpdate(req.body.subscribeId,{
        $push:{
            subscribers:req.user._id
        }
       
    }, {
        new:true
    },(err,result)=>{
        
        if(err){
            return res.status(422).json({error:err})
        }
        User.findByIdAndUpdate(req.user._id,{
            $push:{
                businessSubscribed:req.body.subscribeId
            }
        },{
            new:true
        })
        //.select("-password")
        .then(result=>{
            res.json(result)
        }).catch(err=>{
            return res.status(422).json({error:err})
        })
    })
    
})
router.put('/unsubscribe',requireLogin,(req,res)=>{
    Business.findByIdAndUpdate(req.body.unsubscribeId,{
        $pull:{
            subscribers:req.user._id
        }
       
    }, {
        new:true
    },(err,result)=>{
        if(err){
            return res.status(422).json({error:err})
        }
        User.findByIdAndUpdate(req.user._id,{
            $pull:{
                businessSubscribed:req.body.unsubscribeId
            }
        },{
            new:true
        })
       // .select("-password")
        .then(result=>{
            res.json(result)
        }).catch(err=>{
            return res.status(422).json({error:err})
        })
    })
    
})
//update business cover photo

router.put('/updatecoverphoto',requireLogin,(req,res)=>{
   
    Business.findByIdAndUpdate(req.body.Id,{
        $set:{photo:req.body.imgUrl}
    },{new:true},
    (err,result)=>{
        if(err){
            return res.status(422).json({error:'could not update photo'})
        }
        res.json(result)
    })
})

//update cover video

router.put('/updatecovervideo',requireLogin,(req,res)=>{
    Business.findByIdAndUpdate(req.body.Id,{
        $set:{coverVideo:req.body.videoUrl}
    },{new:true},
    (err,result)=>{
        if(err){
            return res.status(422).json({error:'could not update video'})
        }
        res.json(result)
    })
})
module.exports = router