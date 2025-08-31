// Minimal User model for population in main-service
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: String,
  profile: {
    name: String,
    profilePic: String,
  },
});

module.exports = mongoose.model('User', userSchema);
