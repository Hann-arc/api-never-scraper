const { logger } = require('../utils/logger');

class ProxyService {
  constructor() {
    this.proxies = this.initializeProxies();
    this.currentProxyIndex = 0;
  }

  initializeProxies() {
    return [
      {
        host: process.env.PROXY_HOST || '6n8xhsmh.as.thordata.net',
        port: parseInt(process.env.PROXY_PORT) || 9999,
        username: process.env.PROXY_USERNAME || 'td-customer-mrscraperTrial-country-kr',
        password: process.env.PROXY_PASSWORD || 'P3nNRQ8C2',
        country: 'kr'
      }
    ];
  }

  getNextProxy() {
    const proxy = this.proxies[this.currentProxyIndex];
    this.currentProxyIndex = (this.currentProxyIndex + 1) % this.proxies.length;
    
    logger.info(`Using proxy: ${proxy.host}:${proxy.port}`);
    return proxy;
  }

  getProxyUrl(proxy) {
    return `http://${proxy.username}:${proxy.password}@${proxy.host}:${proxy.port}`;
  }
}

module.exports = ProxyService;