const mongoose = require('mongoose');

const joinRequestSchema = new mongoose.Schema({
  postId: { type: mongoose.Schema.Types.ObjectId, required: true }, // Tweet ID
  requesterId: { type: mongoose.Schema.Types.ObjectId, required: true },
  status: { type: String, enum: ['pending', 'approved', 'denied'], default: 'pending' },
  note: { type: String }, // Optional note from requester
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('JoinRequest', joinRequestSchema);