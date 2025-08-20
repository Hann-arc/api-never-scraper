const crypto = require('crypto');

class FingerprintService {
  constructor() {
    this.userAgents = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    ];

    this.acceptLanguages = [
      'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
      'en-US,en;q=0.9,ko;q=0.8',
      'ja-JP,ja;q=0.9,en-US;q=0.8,en;q=0.7'
    ];
  }

  generateFingerprint() {
    const randomUserAgent = this.userAgents[Math.floor(Math.random() * this.userAgents.length)];
    const randomAcceptLanguage = this.acceptLanguages[Math.floor(Math.random() * this.acceptLanguages.length)];
    
    const fingerprintHash = crypto.createHash('md5')
      .update(randomUserAgent + Date.now())
      .digest('hex');

    return {
      userAgent: randomUserAgent,
      acceptLanguage: randomAcceptLanguage,
      headers: {
        'User-Agent': randomUserAgent,
        'Accept-Language': randomAcceptLanguage,
        'Accept': 'application/json, text/plain, */*',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive'
      }
    };
  }
}

module.exports = FingerprintService;