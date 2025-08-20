const ScraperService = require('../services/scraperService');
const { logger } = require('../utils/logger');
const { validateRequest } = require('../utils/validation');

const scraperService = new ScraperService();

const scrapeNaverProducts = async (req, res) => {
  try {
    const { url, pages = '20' } = req.query;

    const validation = validateRequest(
      typeof url === 'string' ? url : '', 
      typeof pages === 'string' ? pages : undefined
    );

    if (!validation.isValid) {
      logger.warn('Invalid request', { errors: validation.errors });
      return res.status(400).json({
        success: false,
        error: 'Invalid request parameters',
        details: validation.errors
      });
    }

    const maxPages = validation.validatedPages;

    logger.info('Starting real scrape', { 
      url: validation.validatedUrl, 
      maxPages 
    });
    
    const result = await scraperService.scrapeNaverProducts(validation.validatedUrl, maxPages);

    if (result.success) {
      logger.info('Scrape completed', {
        totalProducts: result.totalResults,
        pagesScraped: result.page,
        latency: result.latency
      });

      return res.json({
        success: true,
        data: result.data,
        metadata: {
          totalProducts: result.totalResults,
          pagesScraped: result.page,
          latency: result.latency,
          averageLatencyPerPage: result.page > 0 ? result.latency / result.page : 0
        }
      });
    } else {
      logger.error('Scrape failed', { error: result.error });
      return res.status(500).json({
        success: false,
        error: result.error,
        metadata: {
          pagesScraped: result.page,
          latency: result.latency
        }
      });
    }

  } catch (error) {
    logger.error('Controller error', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

const healthCheck = (req, res) => {
  logger.info('Health check');
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
};

module.exports = { scrapeNaverProducts, healthCheck };