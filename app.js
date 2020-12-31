const express = require('express');
const mongoose = require('mongoose')
const connectDB = require('./config/db');
const auth = require('./routes/auth')
const post = require('./routes/post')
const user = require('./routes/user')
const business = require('./routes/businessRoute')
const businessPost=require('./routes/businessPost')
require('dotenv').config();
const User = require('./models/user')
const Post = require('./models/post')
const cors = require('cors')


const PORT = process.env.PORT || 5000;
connectDB();
const app = express();

app.use(cors())
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(auth)
app.use(post)
app.use(user)
app.use(business)
app.use(businessPost)

app.listen(PORT, ()=>console.log(`server has started on port ${PORT}`));
