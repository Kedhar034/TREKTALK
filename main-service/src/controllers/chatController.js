const Chat = require('../models/Chat');
const User = require('../models/User'); // Register User model for population
const axios = require('axios');

const getChats = async (req, res, next) => {
  try {
    const userResponse = await axios.get('http://localhost:3001/api/auth/me', {
      headers: { Authorization: `Bearer ${req.headers.authorization.split(' ')[1]}` },
    });
    const user = userResponse.data.user;
    // Convert all IDs to strings for comparison
    const followers = (user.followers || []).map(id => id.toString());
    const following = (user.following || []).map(id => id.toString());
    const myId = req.user.id.toString();
    // Mutual followers: users in both followers and following
    const mutualFollowers = followers.filter(id => following.includes(id));

    const chats = await Chat.find({ 
      participants: { $in: [req.user.id] } 
    }).populate('participants', 'username profile.profilePic');

    const potentialUsersResponse = await axios.get('http://localhost:3001/api/auth/search-users', {
      headers: { Authorization: `Bearer ${req.headers.authorization.split(' ')[1]}` },
      params: { query: '' },
    });
    const chatUsers = potentialUsersResponse.data.users.filter(u => 
      mutualFollowers.includes(u.id.toString()) && u.id.toString() !== myId
    );

    res.json({ chats: chats || [], chatUsers: chatUsers || [] });
  } catch (err) {
    next(err);
  }
};

const createChat = async (req, res, next) => {
  try {
    const { participantId } = req.body;
    if (!participantId) return res.status(400).json({ message: 'Participant ID required' });
    let chat = await Chat.findOne({ 
      participants: { $all: [req.user.id, participantId] } 
    });
    if (!chat) {
      chat = new Chat({
        participants: [req.user.id, participantId],
      });
      await chat.save();
    }
    await chat.populate('participants', 'username profile.profilePic');
    req.app.get('io').to(`user:${req.user.id}`).emit('newChat', chat);
    req.app.get('io').to(`user:${participantId}`).emit('newChat', chat);
    res.json({ chat });
  } catch (err) {
    next(err);
  }
};


// Save a message to the chat and return the saved message
const sendMessage = async (chatId, senderId, content) => {
  try {
    const chat = await Chat.findById(chatId);
    if (!chat) throw new Error('Chat not found');
    const message = { senderId, content, createdAt: new Date() };
    chat.messages.push(message);
    await chat.save();
    return message;
  } catch (err) {
    throw err;
  }
};

// Get all messages for a chat
const getMessages = async (req, res, next) => {
  try {
    const { chatId } = req.params;
    const chat = await Chat.findById(chatId);
    if (!chat) return res.status(404).json({ message: 'Chat not found' });
    res.json({ messages: chat.messages });
  } catch (err) {
    next(err);
  }
};

module.exports = { getChats, createChat, sendMessage, getMessages };