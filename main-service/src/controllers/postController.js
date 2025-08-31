const Post = require('../models/Post');
const Notification = require('../models/Notification');
const JoinRequest = require('../models/JoinRequest');
const Comment = require('../models/Comment');
const Chat = require('../models/Chat');
const multer = require('multer');
const path = require('path');
const axios = require('axios');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'Uploads/'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage }).array('images', 5);

const createPost = async (req, res, next) => {
  try {
    upload(req, res, async (err) => {
      if (err) return res.status(400).json({ message: 'Image upload failed' });
      const { content, isPublic, type, location, dates } = req.body;
      if (!content || !type || !['post', 'tweet'].includes(type)) {
        return res.status(400).json({ message: 'Content and valid type required' });
      }
      const images = req.files?.map(file => `/uploads/${file.filename}`) || [];
      // Parse dates to JS Date objects if present
      let parsedDates = [];
      if (type === 'tweet' && dates) {
        parsedDates = dates.split(',').map(d => {
          // Try to parse as ISO, fallback to dd-mm-yy
          const iso = Date.parse(d);
          if (!isNaN(iso)) return new Date(iso);
          // Try dd-mm-yy or dd-mm-yyyy
          const parts = d.trim().split('-');
          if (parts.length === 3) {
            // If year is 2 digits, add 2000
            let year = parts[2].length === 2 ? 2000 + parseInt(parts[2], 10) : parseInt(parts[2], 10);
            let month = parseInt(parts[1], 10) - 1;
            let day = parseInt(parts[0], 10);
            return new Date(year, month, day);
          }
          return null;
        }).filter(Boolean);
      }
      const post = new Post({
        userId: req.user.id,
        content,
        images,
        isPublic: isPublic === 'true',
        type,
        tripDetails: type === 'tweet' ? { location, dates: parsedDates } : undefined,
      });
      await post.save();
      const userResponse = await axios.get(`http://localhost:3001/api/auth/user/${req.user.id}`, {
        headers: { Authorization: `Bearer ${req.headers.authorization.split(' ')[1]}` },
      });
      res.status(201).json({ 
        post: { 
          ...post.toObject(), 
          username: userResponse.data.user.username, 
          profilePic: userResponse.data.user.profile.profilePic 
        } 
      });
    });
  } catch (err) {
    console.error('Error in handleJoinRequest:', err);
    res.status(400).json({ message: err.message || 'Error handling join request' });
  }
};

const getUserPosts = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const posts = await Post.find({ userId }).sort({ createdAt: -1 });
    const postsWithComments = await Promise.all(posts.map(async (post) => {
      const comments = await Comment.find({ postId: post._id }).populate('userId', 'username profile.name profile.profilePic');
      const userResponse = await axios.get(`http://localhost:3001/api/auth/user/${userId}`, {
        headers: { Authorization: `Bearer ${req.headers.authorization.split(' ')[1]}` },
      });
      return { 
        ...post.toObject(), 
        comments, 
        username: userResponse.data.user.username,
        profilePic: userResponse.data.user.profile.profilePic 
      };
    }));
    res.json({ posts: postsWithComments });
  } catch (err) {
    next(err);
  }
};

const getFeed = async (req, res, next) => {
  try {
    const posts = await Post.find({ isPublic: true }).sort({ createdAt: -1 });
    const postsWithData = await Promise.all(posts.map(async (post) => {
      const userResponse = await axios.get(`http://localhost:3001/api/auth/user/${post.userId}`, {
        headers: { Authorization: `Bearer ${req.headers.authorization.split(' ')[1]}` },
      });
      const comments = await Comment.find({ postId: post._id }).populate('userId', 'username profile.name profile.profilePic');
      return { 
        ...post.toObject(), 
        username: userResponse.data.user.username, 
        profilePic: userResponse.data.user.profile.profilePic, 
        comments 
      };
    }));
    res.json({ posts: postsWithData });
  } catch (err) {
    next(err);
  }
};

const addComment = async (req, res, next) => {
  try {
    const { postId, content } = req.body;
    if (!postId || !content) return res.status(400).json({ message: 'Post ID and content required' });
    const comment = new Comment({
      postId,
      userId: req.user.id,
      content,
    });
    await comment.save();
    const post = await Post.findById(postId);
    if (post.userId.toString() !== req.user.id.toString()) {
      const userResponse = await axios.get(`http://localhost:3001/api/auth/user/${req.user.id}`, {
        headers: { Authorization: `Bearer ${req.headers.authorization.split(' ')[1]}` },
      });
      const notification = new Notification({
        userId: post.userId,
        type: 'comment',
        senderId: req.user.id,
        postId,
        message: `${userResponse.data.user.username} commented on your ${post.type}: "${content.slice(0, 50)}..."`,
      });
      await notification.save();
      req.app.get('io').to(`user:${post.userId}`).emit('newNotification', notification);
    }
    const savedComment = await Comment.findById(comment._id).populate('userId', 'username profile.name profile.profilePic');
    res.status(201).json({ comment: savedComment });
  } catch (err) {
    next(err);
  }
};

const sendJoinRequest = async (req, res, next) => {
  try {
    const { postId, note } = req.body;
    if (!postId) return res.status(400).json({ message: 'Post ID required' });
    const post = await Post.findById(postId);
    if (!post || post.type !== 'tweet' || !post.tripDetails) return res.status(400).json({ message: 'Invalid tweet for join request' });
    const existingRequest = await JoinRequest.findOne({ postId, requesterId: req.user.id });
    if (existingRequest) return res.status(400).json({ message: 'Request already sent' });
    const joinRequest = new JoinRequest({
      postId,
      requesterId: req.user.id,
      note,
    });
    await joinRequest.save();
    const userResponse = await axios.get(`http://localhost:3001/api/auth/user/${req.user.id}`, {
      headers: { Authorization: `Bearer ${req.headers.authorization.split(' ')[1]}` },
    });
    const notification = new Notification({
  userId: post.userId,
  type: 'join_request',
  senderId: req.user.id,
  postId,
  joinRequestId: joinRequest._id,
  message: `${userResponse.data.user.username} sent a join request for your trip tweet: "${note || 'No note provided'}"`,
    });
    await notification.save();
    req.app.get('io').to(`user:${post.userId}`).emit('newNotification', notification);
    res.status(201).json({ message: 'Join request sent' });
  } catch (err) {
    next(err);
  }
};

const handleJoinRequest = async (req, res, next) => {
  try {
    const { requestId, status } = req.body;
    if (!requestId || !['approved', 'denied'].includes(status)) return res.status(400).json({ message: 'Invalid request' });
    const joinRequest = await JoinRequest.findById(requestId);
    if (!joinRequest) return res.status(404).json({ message: 'Request not found' });
    const post = await Post.findById(joinRequest.postId);
    if (post.userId.toString() !== req.user.id.toString()) return res.status(403).json({ message: 'Unauthorized' });
    joinRequest.status = status;
    await joinRequest.save();
    let chat = null;
    if (status === 'approved') {
      const token = req.headers.authorization.split(' ')[1];
      // Auto-follow both ways
      await axios.post(`http://localhost:3001/api/auth/follow/${joinRequest.requesterId}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await axios.post(`http://localhost:3001/api/auth/follow/${req.user.id}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Create or find chat
      chat = await Chat.findOne({ 
        participants: { $all: [req.user.id, joinRequest.requesterId] } 
      });
      if (!chat) {
        chat = new Chat({
          participants: [req.user.id, joinRequest.requesterId],
          postId: joinRequest.postId,
        });
        await chat.save();
      }
      await chat.populate('participants', 'username profile.profilePic');
      const userResponse = await axios.get(`http://localhost:3001/api/auth/user/${req.user.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const requesterResponse = await axios.get(`http://localhost:3001/api/auth/user/${joinRequest.requesterId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Notify requester
      const requesterNotification = new Notification({
  userId: joinRequest.requesterId,
  type: 'join_approval',
  senderId: req.user.id,
  postId: joinRequest.postId,
  joinRequestId: joinRequest._id,
  message: `${userResponse.data.user.username} approved your join request for their trip tweet. Start chatting!`,
  chatId: chat._id,
      });
      await requesterNotification.save();
      req.app.get('io').to(`user:${joinRequest.requesterId}`).emit('newNotification', requesterNotification);
      // Notify host
      const hostNotification = new Notification({
  userId: req.user.id,
  type: 'join_approval',
  senderId: joinRequest.requesterId,
  postId: joinRequest.postId,
  joinRequestId: joinRequest._id,
  message: `You approved ${requesterResponse.data.user.username}'s join request. Start chatting!`,
  chatId: chat._id,
      });
      await hostNotification.save();
      req.app.get('io').to(`user:${req.user.id}`).emit('newNotification', hostNotification);
      // Emit newChat event
      req.app.get('io').to(`user:${req.user.id}`).emit('newChat', chat);
      req.app.get('io').to(`user:${joinRequest.requesterId}`).emit('newChat', chat);
    } else if (status === 'denied') {
      const userResponse = await axios.get(`http://localhost:3001/api/auth/user/${req.user.id}`, {
        headers: { Authorization: `Bearer ${req.headers.authorization.split(' ')[1]}` },
      });
      const notification = new Notification({
  userId: joinRequest.requesterId,
  type: 'join_denied',
  senderId: req.user.id,
  postId: joinRequest.postId,
  joinRequestId: joinRequest._id,
  message: `${userResponse.data.user.username} denied your join request for their trip tweet.`,
      });
      await notification.save();
      req.app.get('io').to(`user:${joinRequest.requesterId}`).emit('newNotification', notification);
    }
    res.json({ message: 'Request updated', chatId: status === 'approved' ? chat._id : null });
  } catch (err) {
    next(err);
  }
};

const getComments = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const comments = await Comment.find({ postId }).sort({ createdAt: -1 }).populate('userId', 'username profile.name profile.profilePic');
    res.json({ comments });
  } catch (err) {
    next(err);
  }
};

module.exports = { createPost, getUserPosts, getFeed, addComment, sendJoinRequest, handleJoinRequest, getComments };