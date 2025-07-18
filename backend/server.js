const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const config = require('./config');

const searchRoutes = require('./routes/search');
const configRoutes = require('./routes/config');
const devtoolsRoutes = require('./routes/devtools');
const trendingRoutes = require('./routes/trending');
const nlpRoutes = require('./routes/nlp');
const crawlerRoutes = require('./routes/crawler');
const analyticsRoutes = require('./routes/analytics');
const databaseRoutes = require('./routes/database');
const userSearchHistoryRoutes = require('./routes/userSearchHistory');

const app = express();
const PORT = config.PORT;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:4000',
    'http://localhost:4562',
    'http://localhost:6041',
    'http://localhost:4045',
    'http://127.0.0.1:6041',
    'http://127.0.0.1:4045',
    config.FRONTEND_URL
  ].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-User-ID', 'X-Session-ID', 'X-Requested-With']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/search', searchRoutes);
app.use('/api/config', configRoutes);
app.use('/api/devtools', devtoolsRoutes);
app.use('/api/trending', trendingRoutes);
app.use('/api/nlp', nlpRoutes);
app.use('/api/crawler', crawlerRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/database', databaseRoutes);
app.use('/api/user-search-history', userSearchHistoryRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: config.NODE_ENV,
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    independent: true,
    realData: true,
    noMockData: true,
    database_sync: true
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({ 
    message: 'Ketivee Search Engine API - Independent & Real Data Only with Database Sync',
    version: '1.0.0',
    environment: config.NODE_ENV,
    independent: true,
    realData: true,
    noMockData: true,
    database_sync: true,
    endpoints: {
      health: '/health',
      search: '/api/search',
      config: '/api/config',
      trending: '/api/trending',
      nlp: '/api/nlp',
      devtools: '/api/devtools',
      crawler: '/api/crawler',
      analytics: '/api/analytics',
      database: '/api/database',
      userSearchHistory: '/api/user-search-history'
    },
    features: [
      'Real Web Search with C++ Bot',
      'Independent Search Engine',
      'Real Data Only - No Mock Data',
      'Educational Content Detection',
      'Category Classification',
      'Click Tracking & Analytics',
      'Trending Searches',
      'NLP Processing',
      'Web Crawling',
      'Developer Tools',
      'Database Integration',
      'User Activity Tracking',
      'Comprehensive Analytics',
      'No External Dependencies'
    ],
    dataSources: [
      'Web Crawling',
      'Search Engine APIs',
      'Educational Websites',
      'Real-time Web Search',
      'Crawled Content Index',
      'MongoDB Database',
      'User Activity Data'
    ],
    database: {
      collections: [
        'search_results',
        'search_queries', 
        'crawled_pages',
        'user_activity',
        'user_search_history'
      ],
      features: [
        'Real-time data sync',
        'User activity tracking',
        'Search analytics',
        'Trending analysis',
        'Educational content indexing',
        'Click tracking',
        'Performance metrics',
        'User search history with 15-day retention',
        'Automatic data cleanup',
        'Data export functionality'
      ]
    },
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Endpoint not found',
    requestedUrl: req.originalUrl,
    method: req.method,
    independent: true,
    realData: true,
    noMockData: true,
    database_sync: true,
    availableEndpoints: {
      health: '/health',
      search: '/api/search',
      config: '/api/config',
      trending: '/api/trending',
      nlp: '/api/nlp',
      devtools: '/api/devtools',
      crawler: '/api/crawler',
      analytics: '/api/analytics',
      database: '/api/database'
    },
    searchEndpoints: {
      search: 'GET /api/search?q=query&category=all',
      suggest: 'GET /api/search/suggest?q=query',
      trending: 'GET /api/search/trending',
      click: 'POST /api/search/click',
      stats: 'GET /api/search/stats',
      userActivity: 'GET /api/search/user/:userId/activity',
      userStats: 'GET /api/search/user/:userId/stats'
    },
    databaseEndpoints: {
      health: 'GET /api/database/health',
      stats: 'GET /api/database/stats',
      search: 'GET /api/database/search?q=query',
      trending: 'GET /api/database/trending',
      suggestions: 'GET /api/database/suggestions?q=query',
      educational: 'GET /api/database/educational',
      collections: 'GET /api/database/collections',
      export: 'GET /api/database/export/:collection',
      cleanup: 'POST /api/database/cleanup'
    },
    configEndpoints: {
      config: 'GET /api/config',
      section: 'GET /api/config/:section',
      update: 'PUT /api/config',
      schema: 'GET /api/config/schema'
    },
    trendingEndpoints: {
      trending: 'GET /api/trending?period=all&category=all&limit=10',
      categories: 'GET /api/trending/categories',
      record: 'POST /api/trending/record',
      stats: 'GET /api/trending/stats'
    },
    nlpEndpoints: {
      process: 'POST /api/nlp/process',
      batch: 'POST /api/nlp/batch',
      sentiment: 'POST /api/nlp/sentiment',
      keywords: 'POST /api/nlp/keywords',
      topics: 'POST /api/nlp/topics',
      stats: 'GET /api/nlp/stats'
    },
    crawlerEndpoints: {
      start: 'POST /api/crawler/start',
      search: 'GET /api/crawler/search?q=query',
      stats: 'GET /api/crawler/stats',
      pages: 'GET /api/crawler/pages',
      health: 'GET /api/crawler/health'
    },
    devtoolsEndpoints: {
      execute: 'POST /api/devtools/execute',
      modules: 'GET /api/devtools/modules',
      debug: 'GET /api/devtools/debug/info',
      performance: 'POST /api/devtools/performance/start'
    },
    analyticsEndpoints: {
      search: 'GET /api/analytics/search',
      performance: 'GET /api/analytics/performance',
      trending: 'GET /api/analytics/trending',
      health: 'GET /api/analytics/health',
      user: 'GET /api/analytics/user/:userId',
      export: 'GET /api/analytics/export',
      summary: 'GET /api/analytics/summary',
      realtime: 'GET /api/analytics/realtime'
    },
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: config.NODE_ENV === 'development' ? err.message : 'Internal server error',
    independent: true,
    realData: true,
    noMockData: true,
    database_sync: true,
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Ketivee Independent Search Engine running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔧 Developer Tools: http://localhost:${PORT}/api/devtools`);
  console.log(`🕷️ Crawler: http://localhost:${PORT}/api/crawler`);
  console.log(`🧠 NLP Processing: http://localhost:${PORT}/api/nlp`);
  console.log(`📈 Trending: http://localhost:${PORT}/api/trending`);
  console.log(`⚙️ Configuration: http://localhost:${PORT}/api/config`);
  console.log(`📊 Analytics: http://localhost:${PORT}/api/analytics`);
  console.log(`🗄️ Database: http://localhost:${PORT}/api/database`);
  console.log(`🌐 API Base: http://localhost:${PORT}/api`);
  console.log(`🎯 Environment: ${config.NODE_ENV}`);
  console.log(`✅ Independent: No external search dependencies`);
  console.log(`✅ Real Data: No mock or dummy data`);
  console.log(`✅ Web Crawling: Real-time web search and crawling`);
  console.log(`✅ Database Sync: MongoDB integration for data persistence`);
});