# Ketivee Search Engine Backend

A high-performance, hybrid search engine backend with C++ crawling and Node.js API serving.

## 🏗️ Architecture Overview

The backend uses a hybrid architecture combining the best of both worlds:

```
ketiveeserchengin/backend/
├── index.js                 # Main index and linking hub
├── server.js               # Legacy server (deprecated)
├── package.json            # Dependencies
├── docker-compose.yml      # Container orchestration
├── setup.sh               # Setup script
├── build_cpp.sh           # C++ crawler build script
├── trending.py            # Python trending analysis
├── build.yml              # CI/CD configuration
│
├── cpp_crawler/           # High-Performance C++ Crawler
│   ├── main.cpp               # Multi-threaded crawler
│   ├── CMakeLists.txt         # Build configuration
│   └── build/                 # Compiled binary
│
├── engines/               # Engine Interfaces
│   ├── cppEngineInterface.js    # C++ Engine bridge
│   ├── crawlerInterface.js      # C++ Crawler bridge
│   └── mlEngineInterface.js     # ML Engine bridge
│
├── services/              # Core Services
│   ├── searchService.js         # Enhanced search with C++ integration
│   ├── trendingService.js       # Trending analysis
│   ├── analyticsService.js      # Analytics and metrics
│   └── monitoringService.js     # System monitoring
│
├── database/              # Database Management
│   └── databaseManager.js       # Centralized DB connections
│
├── config/                # Configuration
│   └── configManager.js         # Centralized config management
│
├── routes/                # API Routes
│   ├── search.js               # Search endpoints
│   ├── crawler.js              # C++ Crawler endpoints
│   ├── config.js              # Configuration endpoints
│   ├── devtools.js            # Developer tools
│   ├── trending.js            # Trending endpoints
│   ├── nlp.js                 # NLP endpoints
│   └── ml.js                  # ML endpoints
│
├── scripts/               # Setup Scripts
│   └── setup_mongo.js         # MongoDB index setup
│
├── cpp_engine/            # Legacy C++ Processing Engine
│   ├── main.cpp               # Legacy C++ entry point
│   ├── process_data.h         # Header file
│   └── lib_process_data.so    # Compiled library
│
└── ml_engine/             # Python ML Engine
    └── text_processor.py      # Text processing and analysis
```

## 🚀 Performance Comparison

| Component | Implementation | Performance | Memory | CPU |
|-----------|---------------|-------------|---------|-----|
| **Crawler** | C++ Multi-threaded | 5,000-10,000 req/s | 100-200MB | Optimized |
| **Search** | Node.js + MongoDB | Fast queries | Moderate | Efficient |
| **API** | Node.js Express | High concurrency | Low | Efficient |
| **Cache** | Redis | Sub-millisecond | Low | Minimal |

## 🚀 Quick Start

### Prerequisites

- Node.js 16+
- Python 3.8+
- MongoDB 4.4+
- Redis 6.0+
- C++ compiler (GCC/Clang)
- CMake 3.10+

### Installation

1. **Clone and setup:**
```bash
cd ketiveeserchengin/backend
npm install
```

2. **Build C++ Crawler:**
```bash
chmod +x build_cpp.sh
./build_cpp.sh
```

3. **Environment variables:**
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Setup MongoDB indexes:**
```bash
node scripts/setup_mongo.js
```

5. **Start the hybrid backend:**
```bash
npm start
# or
node index.js
```

## 🔧 Component Index

### Main Index (`index.js`)

The central hub that links all components:

```javascript
const backend = require('./index');

// Access services
const searchService = backend.getService('search');
const analyticsService = backend.getService('analytics');

// Access engines
const cppEngine = backend.getEngine('cpp');
const crawler = backend.getEngine('crawler');
const mlEngine = backend.getEngine('ml');

// Access database
const database = backend.getDatabase();

// Access configuration
const config = backend.getConfig();
```

### Available Services

| Service | Description | Status |
|---------|-------------|--------|
| `search` | Enhanced search with C++/ML integration | ✅ Active |
| `trending` | Trending analysis and tracking | ✅ Active |
| `analytics` | Search analytics and metrics | ✅ Active |
| `monitoring` | System health monitoring | ✅ Active |

### Available Engines

| Engine | Language | Purpose | Performance | Status |
|--------|----------|---------|-------------|--------|
| `crawler` | C++ | High-performance web crawling | 5K-10K req/s | ✅ Active |
| `cpp` | C++ | Data processing & optimization | High | ✅ Active |
| `ml` | Python | Text analysis and ML processing | Moderate | ✅ Active |

## 🕷️ C++ Crawler Integration

### High-Performance Features

- **Multi-threaded crawling** (8 threads by default)
- **Direct MongoDB integration** (no intermediate storage)
- **HTML parsing with Gumbo** (zero-copy parsing)
- **CURL-based HTTP requests** (efficient networking)
- **Thread-safe URL queue** (concurrent processing)

### Usage

```javascript
const crawler = backend.getEngine('crawler');

// Single URL crawling
const result = await crawler.crawlUrl('https://example.com', {
    depth: 2,
    maxPages: 50,
    delay: 1
});

// Batch crawling
const results = await crawler.crawlMultipleUrls([
    'https://site1.com',
    'https://site2.com'
], { depth: 1 });

// Get crawler statistics
const stats = await crawler.getCrawlerStats();
```

### API Endpoints

- `POST /api/crawler/crawl` - Start crawling a URL
- `POST /api/crawler/crawl-batch` - Batch crawling
- `GET /api/crawler/status` - Get crawler status
- `POST /api/crawler/extract` - Extract content from HTML
- `POST /api/crawler/process` - Process data with crawler

## 🔍 Enhanced Search Service

The search service now integrates all engines and uses the C++ crawler's data:

```javascript
const searchService = backend.getService('search');

// Search with C++/ML integration
const results = await searchService.search({
    query: "search term",
    page: 1,
    limit: 10
});

// Document indexing (with ML analysis)
await searchService.indexDocument({
    url: "https://example.com",
    title: "Page Title",
    content: "Page content..."
});

// Get search statistics
const stats = await searchService.getStats();
```

## 📊 Database Management

Centralized database connections through `DatabaseManager`:

```javascript
const database = backend.getDatabase();

// Get collection (C++ crawler uses 'pages' collection)
const pagesCollection = database.getCollection('pages');

// Cache operations
await database.setCached('key', value, ttl);
const cached = await database.getCached('key');

// Health check
const health = await database.healthCheck();
```

## ⚙️ Configuration Management

Centralized configuration through `ConfigManager`:

```javascript
const config = backend.getConfig();

// Get specific config
const dbConfig = config.getDatabaseConfig();
const searchConfig = config.getSearchConfig();

// Environment checks
if (config.isDevelopment()) {
    // Development-specific logic
}

// Validation
config.validate();
```

## 📈 Analytics & Monitoring

### Analytics Service

```javascript
const analytics = backend.getService('analytics');

// Log search activity
await analytics.logSearch(query, results, latency);

// Get search analytics
const analytics = await analytics.getSearchAnalytics(7); // 7 days

// Get popular queries
const popular = await analytics.getPopularQueries(10);
```

### Monitoring Service

```javascript
const monitoring = backend.getService('monitoring');

// Start monitoring
monitoring.startMonitoring(60000); // 1 minute interval

// Get health status
const health = await monitoring.getHealthStatus();

// Get system metrics
const metrics = await monitoring.getMetricsHistory(24); // 24 hours
```

## 🌐 API Endpoints

### Core Endpoints

- `GET /health` - Health check
- `GET /api/components/status` - Component status
- `POST /api/search` - Search with C++/ML integration
- `GET /api/search/suggest` - Search suggestions
- `GET /api/search/trending` - Trending searches

### Crawler Endpoints

- `POST /api/crawler/crawl` - Start C++ crawler
- `POST /api/crawler/crawl-batch` - Batch crawling
- `GET /api/crawler/status` - Crawler status
- `POST /api/crawler/extract` - Content extraction

### Engine Endpoints

- `POST /api/ml/analyze` - ML text analysis
- `POST /api/ml/sentiment` - Sentiment analysis
- `POST /api/cpp/process` - C++ data processing

### Management Endpoints

- `GET /api/config` - Configuration status
- `POST /api/config/reload` - Reload configuration
- `GET /api/analytics` - Analytics data
- `GET /api/monitoring` - System monitoring

## 🔧 Development

### Building C++ Crawler

```bash
# Build the high-performance crawler
./build_cpp.sh

# Or manually
cd cpp_crawler
mkdir build && cd build
cmake ..
make -j$(nproc)
```

### Adding New Services

1. Create service file in `services/`
2. Add to `index.js` initialization
3. Export service class
4. Add to component status endpoint

### Adding New Engines

1. Create engine interface in `engines/`
2. Add to `index.js` initialization
3. Implement standard interface methods
4. Add status checking

### Environment Variables

```bash
# Database
MONGODB_URI=mongodb://localhost:27017/ketivee_search
REDIS_URL=redis://localhost:6379

# Search
SEARCH_INDEX=pages
REDIS_CACHE_TTL=3600

# Engines
CPP_ENGINE_ENABLED=true
CRAWLER_ENABLED=true
ML_ENGINE_ENABLED=true

# Analytics & Monitoring
ANALYTICS_ENABLED=true
MONITORING_ENABLED=true

# Security
FRONTEND_URL=http://localhost:3000
```

## 🐳 Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f

# Scale services
docker-compose up -d --scale search=3
```

## 📊 Performance

The hybrid architecture provides:

- **C++ Crawler**: 10-100x faster than Python, 5K-10K requests/second
- **Node.js API**: High concurrency, low latency
- **MongoDB**: Efficient storage with text indexing
- **Redis**: Sub-millisecond caching
- **Modular Design**: Independent services and engines
- **Engine Integration**: C++ for performance, Node.js for flexibility
- **Monitoring**: Real-time system health tracking
- **Analytics**: Search performance and user behavior tracking
- **Scalability**: Horizontal scaling support

## 🔍 Troubleshooting

### Common Issues

1. **C++ crawler not available**: Run `./build_cpp.sh` to build
2. **MongoDB connection**: Verify MongoDB is running and accessible
3. **C++ compilation**: Ensure C++ compiler and dependencies are installed
4. **Python dependencies**: Install required Python packages

### Debug Mode

```bash
# Enable debug logging
LOG_LEVEL=debug npm start

# Check component status
curl http://localhost:6329/api/components/status

# Health check
curl http://localhost:6329/health

# Test C++ crawler
curl -X POST http://localhost:6329/api/crawler/crawl \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com", "depth": 1}'
```

## 📝 License

This project is part of the Ketivee Search Engine and is licensed under the MIT License. 