require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { scrapeNaverProducts, healthCheck } = require('./controllers/scraperController');
const { logger } = require('./utils/logger');

const app = express();
const PORT = process.env.PORT || 3001;


const apiLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: { success: false, error: 'Too many requests' }
});

const scrapeLimiter = rateLimit({
  windowMs: parseInt(process.env.SCRAPE_LIMIT_WINDOW_MS) || 60000,
  max: parseInt(process.env.SCRAPE_LIMIT_MAX_REQUESTS) || 10,
  message: { success: false, error: 'Too many scrape requests' }
});


app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));


app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    query: req.query,
    ip: req.ip
  });
  next();
});


app.get('/health', healthCheck);
app.get('/naver', apiLimiter, scrapeLimiter, scrapeNaverProducts);


app.use('*', (req, res) => {
  logger.warn(`404: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});


app.use((err, req, res, next) => {
  logger.error('Server error', { error: err.message });
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});


const server = app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
});


process.on('SIGINT', () => {
  logger.info('Shutting down...');
  server.close(() => process.exit(0));
});

process.on('SIGTERM', () => {
  logger.info('Shutting down...');
  server.close(() => process.exit(0));
});