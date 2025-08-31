const express  = require('express');
const mongoose = require('mongoose');

const connectDB = async () =>{
    try{
        console.log('[DB] Connecting to MongoDB:', process.env.DB_URL);
        await mongoose.connect(process.env.DB_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('[DB] MongoDB connected');
    }
    catch(err){
        console.error('[DB] MongoDB connection error:', err);
        throw err;
    }
}

exports = connectDB;
module.exports = connectDB;

