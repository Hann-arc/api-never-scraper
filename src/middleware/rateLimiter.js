const rateLimit = require('express-rate-limit');

const apiLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const scrapeLimiter = rateLimit({
  windowMs: parseInt(process.env.SCRAPE_LIMIT_WINDOW_MS) || 60000,
  max: parseInt(process.env.SCRAPE_LIMIT_MAX_REQUESTS) || 10,
  message: {
    success: false,
    error: 'Too many scrape requests, please try again later.'
  }
});

module.exports = { apiLimiter, scrapeLimiter };