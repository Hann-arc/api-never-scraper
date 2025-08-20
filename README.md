

##  Features

* Express.js API with secure middleware (Helmet, CORS, Morgan, Winston logging)
* Proxy support with rotation (configured via `.env`)
* Request fingerprinting (randomized User-Agent & Accept-Language)
* Retry mechanism with randomized delays
* API-level and scrape-level rate limiting
* Scalable structure with services, controllers, and middleware separation

---

## ⚙ Setup Instructions

1. **Clone repository**

   ```bash
  [https://github.com/Hann-arc/api-never-scraper.git](https://github.com/Hann-arc/api-never-scraper.git)
   cd naver-scraper-api
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables**
   Create a `.env` file in the root directory:

   ```env
   PORT=3001
   NODE_ENV=development
   LOG_LEVEL=info

   MAX_CONCURRENT_REQUESTS=5
   REQUEST_TIMEOUT=30000
   MAX_RETRIES=3

   PROXY_HOST=your-proxy-host
   PROXY_PORT=9999
   PROXY_USERNAME=your-username
   PROXY_PASSWORD=your-password

   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   SCRAPE_LIMIT_WINDOW_MS=60000
   SCRAPE_LIMIT_MAX_REQUESTS=10
   ```


4. **Start the server**

   ```bash
   # Development mode (auto reload)
   npm run dev

   # Production mode
   npm start
   ```

---

##  Run & Test Instructions

### 1. Run locally

```bash
npm run dev
```

Server will start at `http://localhost:3001`

### 2. Expose API with Ngrok

```bash
ngrok http 3001
```

Ngrok will provide a public HTTPS endpoint, for example:

```
https://0cec0532e57f.ngrok-free.app -> http://localhost:3001
```

### 3. Health check

```bash
GET http://localhost:3001/health
```

Response:

```json
{
  "status": "healthy",
  "timestamp": "2025-08-20T06:42:00.000Z",
  "uptime": 120.45,
  "memory": { ... }
}
```

---

##  Scraper Explanation

This scraper is designed with **anti-detection techniques** to avoid being blocked by Naver:

1. **Proxy Rotation**

   * Uses datacenter or residential proxies configured in `.env`.
   * Rotates proxies for each request (`ProxyService`).

2. **Request Fingerprinting**

   * Randomizes `User-Agent` and `Accept-Language` headers per request (`FingerprintService`).
   * Mimics real browsers from different OS.

3. **Retries with Delays**

   * Failed requests are retried up to `MAX_RETRIES`.
   * Each retry waits a random delay (2s–5s).

4. **Randomized Crawl Pace**

   * Adds random wait (1s–3s) between page scrapes to simulate human browsing.

5. **Rate Limiting**

   * Global API requests limited per IP.
   * Specific `/naver` scrape endpoint has stricter limits.

6. **Request Validation**

   * Only accepts Naver Shopping URLs.
   * Validates and caps `pages` parameter.

---

##  API Endpoints

### Health Check

```http
GET /health
```

### Scrape Products

```http
GET /naver?url=<NAVER_SEARCH_URL>&pages=<NUMBER_OF_PAGES>
```

#### Parameters

* `url` (required): Full Naver Shopping search URL (e.g., `https://search.shopping.naver.com/search/all?query=iphone`)
* `pages` (optional): Number of pages to scrape (default: 20, max: 50)

#### Example Request

```http
GET https://0cec0532e57f.ngrok-free.app/naver?url=https://search.shopping.naver.com/search/all?query=iphone&pages=3
```

#### Example Response

```json
{
  "success": true,
  "data": [
    {
      "id": "1234567890",
      "title": "Apple iPhone 14 Pro",
      "price": 1399000,
      "imageUrl": "https://shopping-phinf.pstatic.net/...",
      "shopName": "Apple Store",
      "rating": 4.8,
      "reviewCount": 1520,
      "productUrl": "https://search.shopping.naver.com/catalog/1234567890"
    }
  ],
  "metadata": {
    "totalProducts": 120,
    "pagesScraped": 3,
    "latency": 8567,
    "averageLatencyPerPage": 2855.67
  }
}
```

---

## 🛠️ Project Structure

```
naver-scraper-api/
├── src/
│   ├── app.js                # Express app entry point
│   ├── controllers/          # API controllers
│   ├── services/             # Scraper, proxy, fingerprint services
│   ├── middleware/           # Error handler & rate limiter
│   └── utils/                # Logger, validation, delay helpers
├── .env                      # Environment configuration
├── package.json
└── README.md
```

---

## Example Workflow

1. Start API with `npm run dev`
2. Expose to internet with `ngrok http 3001`
3. Call the API with query:

   ```bash
   curl "https://<NGROK_URL>/naver?url=https://search.shopping.naver.com/search/all?query=iphone&pages=2"
   ```
4. Get structured JSON product data.


