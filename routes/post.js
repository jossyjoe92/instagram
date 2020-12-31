const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const Post = require('../models/post')
const requireLogin = require('../middleware/requireLogin')


router.get('/allpost',requireLogin,(req,res)=>{
    Post.find()
    .populate('postedBy',"_id name photo")
    .populate('comments.postedBy',"_id name")
    .then(post=>{
        posts=post.sort((a, b) =>a.timestamp < b.timestamp ? 1 : -1)
        res.json({posts})
    })
    .catch(err=>{
        console.log(err)
    })
})

router.get('/post/:id',requireLogin,(req,res)=>{
    Post.findOne({_id:req.params.id})
    .populate('postedBy',"_id name photo email")
    .populate('comments.postedBy',"_id name photo")
    .then(post=>{
        res.json({post})
    })
    .catch(err=>{
        console.log(err)
    })
})

router.post('/createpost',requireLogin,(req,res)=>{

    const {title,imgUrl} = req.body
    if(!title||!imgUrl){
        return res.status(422).json({error:'Please add all the fields'})
    }
    req.user.password = undefined
    const post = new Post({
        title,
        photo:imgUrl,
        postedBy:req.user

    })
    post.save()
    .then(result=>{
        res.json({post:result})
    })
    .catch(err=>{
        console.log(err)
    })
})

router.get('/mypost',requireLogin,(req,res)=>{
    Post.find({postedBy:req.user._id})
    .populate('postedBy', '_id name')
    .then(myposts=>{
        res.json({myposts})
    })
    .catch(err=>{
        console.log(err)
    })
})

router.put('/like',requireLogin,(req,res)=>{
    Post.findByIdAndUpdate(req.body.postId,{
        $push:{likes:req.user._id}
    },{
        new:true
    })
    .populate('postedBy',"_id name email photo")
    .populate('comments.postedBy',"_id name photo")
    .exec((err,result)=>{
        if(err){
            return res.status(422).json({error:err})
        }else{
            
            res.json(result)
        }
    })
})

router.put('/unlike',requireLogin,(req,res)=>{
    Post.findByIdAndUpdate(req.body.postId,{
        $pull:{likes:req.user._id}
    },{
        new:true
    })
    .populate('postedBy',"_id name email photo")
    .populate('comments.postedBy',"_id name photo")
    .exec((err,result)=>{
        if(err){
            return res.status(422).json({error:err})
        }else{
            
            res.json(result)
        }
    })
})

router.put('/comment',requireLogin,(req,res)=>{
    const comment = {
        text:req.body.text,
        postedBy:req.user._id
    }
    Post.findByIdAndUpdate(req.body.postId,{
        $push:{comments:comment}
    },{
        new:true
    })
    .populate("comments.postedBy","_id name photo")
    .populate("postedBy","_id name photo")
    .exec((err,result)=>{
        if(err){
            return res.status(422).json({error:err})
        }else{
            res.json(result)
        }
    })
})


router.delete('/deletepost/:postId',requireLogin,(req,res)=>{
    Post.findOne({_id:req.params.postId})
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
// later to fix dis. move comments to its own model
router.put('/deletecomment/:postId',requireLogin,(req,res)=>{
  
/*
    Post.findOne({_id:req.params.postId})
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
    */
   const comment = {
    _id:req.body.commentId,
    postedBy:req.user._id
}
   Post.findByIdAndUpdate(req.params.postId,{
    $pull:{comments:comment}
},{
    new:true
})
.populate('postedBy',"_id name")
.populate('comments.postedBy',"_id name")
.exec((err,result)=>{
    if(err){
        return res.status(422).json({error:err})
    }else{
        
        res.json(result)
    }
}) 

})

router.get('/mysubscribedpost',requireLogin,(req,res)=>{
    Post.find({postedBy:{$in:req.user.following}})
    .populate('postedBy',"_id name")
    .populate('comments.postedBy',"_id name")
    .then(posts=>{
        res.json({posts})
    })
    .catch(err=>{
        console.log(err)
    })
})

module.exports = router