const mongoose = require('mongoose')
const {ObjectId} = mongoose.Schema.Types

const businessSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    location:{
        type:String,
        required:true
    },
    address:{
        type:String,
        required:true
    },
    isVerified:{
        type:Boolean,
        default:false
    },
    isSubscribed:{
        type:Boolean,
        default:false
    },
    password:{
        type:String,
       
    },
    photo:{
        type:String,
        default:"https://res.cloudinary.com/jossyjoe/image/upload/v1606258324/UserIcon_tmu1v6.jpg"
    },
    phone:{
        type:String,
        required:true
    },
    coverVideo:{
        type:String,
        default:"https://res.cloudinary.com/jossyjoe/image/upload/v1606258324/UserIcon_tmu1v6.jpg"
    },
    description:{
        type:String,
        required:true
    },
    companyWebsite:{
        type:String,
    },
   subscribers:[{type:ObjectId,ref:"User"}],
   
})

module.exports = mongoose.model("Business", businessSchema);