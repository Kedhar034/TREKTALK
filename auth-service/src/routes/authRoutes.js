const express = require('express');
const User = require('../models/User');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { signup, login, getMe, oauthCallback, updateUsername, searchUsers, follow, unfollow } = require('../controllers/authController');
const validateUser = require('../middleware/validateUser');
const jwt = require('jsonwebtoken');

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID || '0643882920727-huieot1khvgldorgflgm66r8k3ko0lkt.apps.googleusercontent.com',
  clientSecret: process.env.GOOGLE_CLIENT_SECRET || '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',
  callbackURL: 'http://localhost:3001/api/auth/google/callback',
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ googleId: profile.id });
    if (!user) {
      // Try to find by email or username
      user = await User.findOne({ $or: [
        { email: profile.emails[0].value },
        { username: profile.emails[0].value }
      ] });
      if (user) {
        // Link Google ID to existing user
        user.googleId = profile.id;
        user.isOAuthTempUsername = false;
        await user.save();
      }
    }
    if (!user) {
      // Create new user with temp username (email), will prompt for username on frontend
      user = new User({
        username: profile.emails[0].value || profile.displayName,
        email: profile.emails[0].value,
        googleId: profile.id,
        isOAuthTempUsername: true,
        password: Math.random().toString(36),
        profile: { 
          name: profile.displayName, 
          phone: '',
          profilePic: profile.photos[0]?.value || 'https://via.placeholder.com/150'
        },
      });
      await user.save();
    }
    done(null, user);
  } catch (err) {
    done(err);
  }
}));

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  const user = await User.findById(id);
  done(null, user);
});

const router = express.Router();


router.post('/signup', (req, res, next) => { console.log('[ROUTE] POST /signup'); next(); }, validateUser, signup);
router.post('/login', (req, res, next) => { console.log('[ROUTE] POST /login'); next(); }, validateUser, login);
router.get('/google', (req, res, next) => { console.log('[ROUTE] GET /google'); next(); }, passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', (req, res, next) => { console.log('[ROUTE] GET /google/callback'); next(); }, passport.authenticate('google', { failureRedirect: '/login' }), oauthCallback);

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  console.log('[AUTH MIDDLEWARE] Authorization header:', authHeader);
  const token = authHeader?.split(' ')[1];
  if (!token) {
    console.log('[AUTH MIDDLEWARE] No token found in header');
    return res.status(401).json({ message: 'No token' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    console.log('[AUTH MIDDLEWARE] Invalid token:', err);
    res.status(401).json({ message: 'Invalid token' });
  }
};


// New: Get public user info by ID (for poster name/pic)
router.get('/user/:id', async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('username profile.profilePic');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user });
  } catch (err) {
    next(err);
  }
});

router.get('/me', (req, res, next) => { console.log('[ROUTE] GET /me'); next(); }, authMiddleware, getMe);
router.post('/update-username', authMiddleware, validateUser, updateUsername);
router.get('/search-users', authMiddleware, searchUsers);
router.post('/follow/:userId', authMiddleware, follow);
router.post('/unfollow/:userId', authMiddleware, unfollow);

module.exports = router;