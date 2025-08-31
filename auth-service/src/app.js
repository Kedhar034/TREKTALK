const express = require("express");
const cors = require("cors");
const authRoutes = require('./routes/authRoutes');
const passport = require('passport');
require('dotenv').config();
const session = require('express-session');


const cookieParser = require('cookie-parser');

const app = express();
app.use(cookieParser());
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));

// just to parse json bodies
app.use(express.json());
//initialize the passport middleware
app.use(passport.initialize());

app.use(session({
  secret: process.env.SESSION_SECRET || 'your_secret_key',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }, // Set to true if using HTTPS
}));

app.use(passport.initialize());
app.use(passport.session());

app.use('/api/auth', authRoutes);

app.use((req, res, next) => {
  console.log(`[REQUEST] ${req.method} ${req.url}`);
  next();
});

app.use((err,req,res,next) =>{
    console.error('[APP ERROR]', err.stack);
    res.status(500).send("something broke");
})

module.exports = app;



