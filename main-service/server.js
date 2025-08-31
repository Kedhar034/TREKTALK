const { server } = require('./src/app');
const app = require('./src/app');
const connectDB = require('./src/config/db');
const dotenv = require('dotenv');

dotenv.config();

const PORT = process.env.PORT || 3002;

connectDB()
    .then(() => {
    server.listen(PORT, () => { // Use server instead of app for Socket.io
      console.log(`Main service running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Failed to connect to DB:', err);
    process.exit(1);
  });

