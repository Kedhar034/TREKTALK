const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true },
  type: { type: String, enum: ['comment', 'join_request', 'join_approval', 'join_denied'], required: true },
  senderId: { type: mongoose.Schema.Types.ObjectId, required: true },
  postId: { type: mongoose.Schema.Types.ObjectId, required: true },
  message: { type: String, required: true },
  chatId: { type: mongoose.Schema.Types.ObjectId }, // Optional, for join_approval
  joinRequestId: { type: mongoose.Schema.Types.ObjectId }, // Optional, for join approval/denied actions
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Notification', notificationSchema);