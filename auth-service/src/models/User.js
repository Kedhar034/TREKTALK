const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String, unique: true }, // New
  isOAuthTempUsername: { type: Boolean, default: false }, // New: Flag for OAuth users

  profile: {
    name: { type: String },  // From signup form
    phone: { type: String }, // From signup form
    googleId: { type: String }, // For OAuth users
    profilePic: { type: String, default: 'https://via.placeholder.com/150' }, // New
    bio: { type: String, default: '' },
    pastTrips: { type: [String], default: [] },  // Array for future trip IDs or names
  },
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // New
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // New
  createdAt: { type: Date, default: Date.now },
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword){
    return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);