const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const User = require('../models/user')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const requireLogin = require('../middleware/requireLogin')

router.get('/protected',requireLogin,(req,res)=>{
    res.send('hello user')
})
router.post('/signup',(req,res)=>{

    const {name,email,password,imgUrl} = req.body;
    if(!email||!password||!name){
        return res.status(422).json({error:'please add all the fields'})
    }
 
    User.findOne({email:email})
    .then((savedUser)=>{
        if(savedUser){
            return res.status(422).json({error:"A user with this email already exists"})
        }
        bcrypt.hash(password,12)
        .then(hashedPassword=>{
            const user = new User({
                email,
                password:hashedPassword,
                name,
                photo:imgUrl
            })
            user.save()
            .then(user=>{
                res.json({message:'User saved Successfully'})
            })
            .catch(err=>{
                console.log(err)
            })
        })
       
      
    })
    .catch(err=>{
        console.log(err)
    })
})

router.post('/signin',(req,res)=>{
    const {email,password} = req.body;
    if(!email||!password){
       return res.status(422).json({error:'please add email or password'})
    }
    User.findOne({email:email})
    .then(savedUser=>{
        if(!savedUser){
           return res.status(422).json({error:'Invalid email or password'})
        }
        bcrypt.compare(password,savedUser.password)
        .then(doMatch=>{
            if(doMatch){
                //res.json({message:'Successfully Signed In'})
                const token = jwt.sign({_id:savedUser._id},process.env.jwt)
                const {_id,name,email,about,followers,following,businessRegistered,photo}=savedUser
                res.json({token,user:{_id, name,email,about,followers,following,businessRegistered,photo}})
            }else{
                return res.status(422).json({error:'Invalid Email or password'})
            }
        }) .catch(err=>{
            console.log(err)
        })
    })
    .catch(err=>{
        console.log(err)
    })
})
module.exports = router