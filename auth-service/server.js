const app = require('./src/app');
const connectDB = require('./src/config/db');
const dotenv = require('dotenv');

dotenv.config();

const PORT = process.env.PORT || 3001;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`[SERVER] Auth service running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('[SERVER] Failed to connect to DB:', err);
    process.exit(1);
  });