const User = require('../models/User');
const jwt = require('jsonwebtoken');
const passport = require('passport');

const signup = async (req, res, next) => {
  try {
    const { username, email, password, name, phone } = req.body;
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(400).json({ message: 'Username or email already taken' });
    }
    const user = new User({
      username,
      email,
      password,
      profile: { name, phone, profilePic: 'https://via.placeholder.com/150' },
    });
    await user.save();
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(201).json({ 
      token, 
      user: { 
        id: user._id, 
        username, 
        email, 
        profile: user.profile, 
        isOAuthTempUsername: user.isOAuthTempUsername,
        followers: user.followers.length,
        following: user.following.length 
      } 
    });
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    console.log('Login request body:', req.body);
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    console.log('User found:', user);
    if (!user || !(await user.comparePassword(password))) {
      console.log('Invalid credentials');
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    console.log('Login successful, token:', token);
    res.json({ 
      token, 
      user: { 
        id: user._id, 
        username, 
        email: user.email, 
        profile: user.profile, 
        isOAuthTempUsername: user.isOAuthTempUsername,
        followers: user.followers.length,
        following: user.following.length 
      } 
    });
  } catch (err) {
    console.error('Login error:', err);
    next(err);
  }
};

const getMe = async (req, res, next) => {
  try {
    console.log('getMe req.user:', req.user);
    const user = await User.findById(req.user.id).select('-password');
    console.log('getMe user found:', user);
    if (!user) {
      console.log('User not found in getMe');
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ 
      user: { 
        id: user._id, 
        username: user.username, 
        email: user.email, 
        profile: user.profile, 
        isOAuthTempUsername: user.isOAuthTempUsername,
        followers: user.followers ? user.followers.map(id => id.toString()) : [],
        following: user.following ? user.following.map(id => id.toString()) : []
      } 
    });
  } catch (err) {
    console.error('getMe error:', err);
    next(err);
  }
};

const oauthCallback = (req, res) => {
  const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
  res.redirect(`http://localhost:3000/profile?token=${token}`);
};

const updateUsername = async (req, res, next) => {
  try {
    const { username } = req.body;
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'Username already taken' });
    }
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    user.username = username;
    user.isOAuthTempUsername = false;
    await user.save();
    res.json({ 
      user: { 
        id: user._id, 
        username, 
        email: user.email, 
        profile: user.profile, 
        isOAuthTempUsername: user.isOAuthTempUsername,
        followers: user.followers.length,
        following: user.following.length 
      } 
    });
  } catch (err) {
    next(err);
  }
};

const searchUsers = async (req, res, next) => {
  try {
    const { query } = req.query;
    let users;
    if (!query) {
      // If no query, return all users (for chat mutual friends discovery)
      users = await User.find({}).select('_id username profile.name profile.profilePic');
    } else {
      users = await User.find({ 
        username: { $regex: query, $options: 'i' } 
      }).select('_id username profile.name profile.profilePic');
    }
    res.json({ users: users.map(user => ({
      id: user._id.toString(),
      username: user.username,
      name: user.profile.name,
      profilePic: user.profile.profilePic
    })) });
  } catch (err) {
    next(err);
  }
};

const follow = async (req, res, next) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }
    const currentUser = await User.findById(req.user.id);
    const targetUser = await User.findById(userId);
    if (!targetUser) return res.status(404).json({ message: 'User not found' });
    let updated = false;
    // A follows B
    if (!currentUser.following.includes(userId)) {
      currentUser.following.push(userId);
      updated = true;
    }
    if (!targetUser.followers.includes(req.user.id)) {
      targetUser.followers.push(req.user.id);
      updated = true;
    }
    // Ensure mutual: B follows A if not already
    if (!targetUser.following.includes(req.user.id)) {
      targetUser.following.push(req.user.id);
      updated = true;
    }
    if (!currentUser.followers.includes(userId)) {
      currentUser.followers.push(userId);
      updated = true;
    }
    if (updated) {
      await currentUser.save();
      await targetUser.save();
    }
    res.json({ message: 'Mutual Followed' });
  } catch (err) {
    next(err);
  }
};

const unfollow = async (req, res, next) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }
    const currentUser = await User.findById(req.user.id);
    const targetUser = await User.findById(userId);
    if (!targetUser) return res.status(404).json({ message: 'User not found' });
    currentUser.following = currentUser.following.filter(id => id.toString() !== userId);
    targetUser.followers = targetUser.followers.filter(id => id.toString() !== req.user.id.toString());
    await currentUser.save();
    await targetUser.save();
    res.json({ message: 'Unfollowed' });
  } catch (err) {
    next(err);
  }
};

module.exports = { signup, login, getMe, oauthCallback, updateUsername, searchUsers, follow, unfollow };