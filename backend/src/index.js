require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const cron = require('node-cron');
const db = require('./models');
const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.BACKEND_PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/auth', authRoutes);
app.use('/api/businesses', require('./routes/business'));
app.use('/api/businesses/:businessId/accounts', require('./routes/chartAccount'));
app.use('/api/businesses/:businessId/transactions', require('./routes/transaction'));
app.use('/api/businesses/:businessId/fixed-assets', require('./routes/fixedAsset'));
app.use('/api/businesses/:businessId/inventory', require('./routes/inventory'));
app.use('/api/businesses/:businessId/contacts', require('./routes/contact'));
app.use('/api/businesses/:businessId/tax', require('./routes/tax'));

// Monthly depreciation cron job (runs on 1st of each month at midnight)
cron.schedule('0 0 1 * *', async () => {
  console.log('Running monthly depreciation job...');
  try {
    // Run depreciation for all active assets
    const { runMonthlyDepreciation } = require('./services/depreciationService');
    await runMonthlyDepreciation();
    console.log('Monthly depreciation completed');
  } catch (error) {
    console.error('Depreciation job failed:', error);
  }
});

// Manual depreciation trigger endpoint
app.post('/api/depreciation/run', async (req, res) => {
  try {
    const { runMonthlyDepreciation } = require('./services/depreciationService');
    const result = await runMonthlyDepreciation();
    res.json({ message: 'Depreciation run completed', result });
  } catch (error) {
    console.error('Manual depreciation failed:', error);
    res.status(500).json({ error: 'Failed to run depreciation' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Database sync and server start
async function startServer() {
  try {
    // Test database connection
    await db.sequelize.authenticate();
    console.log('Database connection established successfully.');
    
    // Sync database (in production, use migrations)
    await db.sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
    console.log('Database synced');
    
    // Start server
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to start server:', error);
    process.exit(1);
  }
}

startServer();

module.exports = app;
