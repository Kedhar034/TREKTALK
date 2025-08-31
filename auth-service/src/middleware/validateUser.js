const validateUser = (req, res, next) => {
  const { username, email, password, name, phone } = req.body;
  console.log('[VALIDATE USER] Path:', req.path, 'Body:', req.body);
  if (req.path === '/signup') {
    if (!username || !email || !password || !name || !phone) {
      console.error('[VALIDATE USER] Missing signup fields');
      return res.status(400).json({ message: 'Username, email, password, name, and phone are required' });
    }
  } else if (req.path === '/login') {
    if (!username || !password) {
      console.error('[VALIDATE USER] Missing login fields');
      return res.status(400).json({ message: 'Username and password are required' });
    }
  } else if (req.path === '/update-username') {
    if (!username) {
      console.error('[VALIDATE USER] Missing username for update');
      return res.status(400).json({ message: 'Username is required' });
    }
  }
  next();
};

module.exports = validateUser;