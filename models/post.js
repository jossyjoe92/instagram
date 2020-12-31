const mongoose = require('mongoose')
const {ObjectId} = mongoose.Schema.Types

const postSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true
    },
  
    photo:{
        type:String,
        required:true
        
    },
    comments:[{
        text:String,
        postedBy:{type:ObjectId,ref:"User"},
        timestamp: { type: Date, 'default': Date.now }
    }],
    likes:[{type:ObjectId,
        ref:'User'}],
   
    postedBy:{
        type:ObjectId,
        ref:'User'
    },
    timestamp: { type: Date, 'default': Date.now }
})

module.exports = mongoose.model("Post", postSchema);