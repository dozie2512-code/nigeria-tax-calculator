require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const db = require('./models');
const routes = require('./routes');
const { runMonthlyDepreciation } = require('./services/depreciation');

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', routes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Cron job for monthly depreciation (runs on the 1st of every month at 00:00)
cron.schedule('0 0 1 * *', async () => {
  console.log('Running monthly depreciation cron job...');
  try {
    await runMonthlyDepreciation();
    console.log('Monthly depreciation completed successfully');
  } catch (error) {
    console.error('Monthly depreciation failed:', error);
  }
});

// Database sync and server start
const startServer = async () => {
  try {
    await db.sequelize.authenticate();
    console.log('Database connection established successfully.');
    
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
