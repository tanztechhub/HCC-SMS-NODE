const express = require('express');
const cors = require('cors');

// Call only after connecting MongoDB: models bind to the SMS connection on import.
function createApp() {
  const app = express();
  const origins = (process.env.CORS_ORIGINS || 'http://localhost:5173,http://127.0.0.1:5173')
    .split(',').map(origin => origin.trim()).filter(Boolean);
  app.use(cors({ origin: origins }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  const router = require('./index');
  app.use('/hcc-sms', router);
  app.get('/api/health', (req, res) => res.redirect(307, '/hcc-sms/api/health'));
  app.get('/', (req, res) => res.json({ status: 'success', message: 'HCC SMS server is running' }));
  app.use((req, res) => res.status(404).json({ status: 'error', message: 'Route not found' }));
  app.use((error, req, res, next) => {
    console.error(error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  });
  return app;
}

module.exports = { createApp };
