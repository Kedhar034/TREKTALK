const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  userId : {type:mongoose.Schema.Types.ObjectId, ref:'User', required:true},
  content : { type:String , required:true},
  images: [{ type: String }],
  isPublic: { type: Boolean, default: true }, // Public or profile-only
  type: { type: String, enum: ['post', 'tweet'], required: true }, 
  tripDetails: { // New for join requests
    location: { type: String },
    dates: [{ type: Date }],
  },
  createdAt: { type: Date, default: Date.now }
});

postSchema.pre('save', function(next) {
  console.log('[POST MODEL] Creating post for user:', this.userId);
  next();
});


module.exports = mongoose.model('Post', postSchema);