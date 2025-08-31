const express = require('express');
const { createPost, getUserPosts, getFeed, addComment, sendJoinRequest, handleJoinRequest, getComments } = require('../controllers/postController');
const { getNotifications, markRead } = require('../controllers/notificationController');
const { getChats, createChat, getMessages } = require('../controllers/chatController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/posts', authMiddleware, createPost);
router.get('/posts/user/:userId', authMiddleware, getUserPosts);
router.get('/feed', authMiddleware, getFeed);
router.post('/comments', authMiddleware, addComment);
router.get('/comments/:postId', authMiddleware, getComments);
router.post('/join-request', authMiddleware, sendJoinRequest);
router.post('/handle-join-request', authMiddleware, handleJoinRequest);
router.get('/notifications', authMiddleware, getNotifications);
router.post('/notifications/read/:notificationId', authMiddleware, markRead);
router.get('/chats', authMiddleware, getChats);
router.post('/chats', authMiddleware, createChat);
router.get('/chats/:chatId/messages', authMiddleware, getMessages);

module.exports = router;