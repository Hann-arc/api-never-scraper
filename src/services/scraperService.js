const axios = require("axios");
const ProxyService = require("./proxyService");
const FingerprintService = require("./fingerprintService");
const { logger } = require("../utils/logger");
const { delay, getRandomDelay } = require("../utils/delay");
const { HttpsProxyAgent } = require("https-proxy-agent");

class ScraperService {
  constructor() {
    this.proxyService = new ProxyService();
    this.fingerprintService = new FingerprintService();
    this.config = {
      maxRetries: parseInt(process.env.MAX_RETRIES) || 3,
      timeout: parseInt(process.env.REQUEST_TIMEOUT) || 30000,
    };

    this.axiosInstance = axios.create({
      timeout: this.config.timeout,
    });
  }

  async scrapeNaverProducts(url, maxPages = 20) {
    const startTime = Date.now();
    let currentPage = 1;
    const allProducts = [];

    try {
      logger.info(`Starting scrape for: ${url}`);

      while (currentPage <= maxPages) {
        const pageUrl = this.constructPageUrl(url, currentPage);
        logger.info(`Scraping page ${currentPage}`);

        try {
          const response = await this.makeRequest(pageUrl);

          if (response && response.cards) {
            const products = this.parseProducts(response);
            allProducts.push(...products);

            if (products.length === 0) {
              logger.info("No more products found");
              break;
            }

            logger.info(
              `Found ${products.length} products on page ${currentPage}`
            );
          }

          await delay(getRandomDelay(1000, 3000));
        } catch (error) {
          logger.warn(`Failed page ${currentPage}: ${error.message}`);
        }

        currentPage++;
      }

      const latency = Date.now() - startTime;

      return {
        success: true,
        data: allProducts,
        latency,
        page: currentPage - 1,
        totalResults: allProducts.length,
      };
    } catch (error) {
      const latency = Date.now() - startTime;
      logger.error(`Scraping failed: ${error.message}`);

      return {
        success: false,
        data: null,
        error: error.message,
        latency,
        page: currentPage - 1,
      };
    }
  }

  async makeRequest(url, retryCount = 0) {
    try {
      const proxy = this.proxyService.getNextProxy();
      const fingerprint = this.fingerprintService.generateFingerprint();

      const agent = new HttpsProxyAgent(
        `http://${proxy.username}:${proxy.password}@${proxy.host}:${proxy.port}`
      );

      const response = await this.axiosInstance.get(url, {
        headers: fingerprint.headers,
        httpsAgent: agent,
      });

      return response.data;
    } catch (error) {
      if (retryCount < this.config.maxRetries) {
        logger.warn(`Retry ${retryCount + 1}/${this.config.maxRetries}`);
        await delay(getRandomDelay(2000, 5000));
        return this.makeRequest(url, retryCount + 1);
      }
      throw error;
    }
  }

parseProducts(data) {
  try {
    if (!data || !data.data || !Array.isArray(data.data)) {
      return [];
    }

    return data.data
      .filter((item) => item.card && item.card.product) 
      .map((item) => {
        const product = item.card.product;
        return {
          id: product.nvMid || "",
          title: product.productName || "",
          price: product.discountedSalePrice || product.salePrice || 0,
          imageUrl: product.images && product.images[0] ? product.images[0].imageUrl : "",
          shopName: product.mallName || "",
          rating: product.averageReviewScore || 0,
          reviewCount: product.totalReviewCount || 0,
          productUrl: product.productUrl ? product.productUrl.pcUrl || product.productUrl.mobileUrl : "",
        };
      })
      .filter((product) => product.id && product.title); 
  } catch (error) {
    logger.error(`Parse error: ${error.message}`);
    return [];
  }
}
  constructPageUrl(baseUrl, page) {
    try {
      const url = new URL(baseUrl);
      url.searchParams.set("cursor", page.toString());
      return url.toString();
    } catch (error) {
      return baseUrl;
    }
  }
}

module.exports = ScraperService;
