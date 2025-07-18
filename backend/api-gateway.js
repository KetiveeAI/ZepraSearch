const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Import existing services
const RealSearchService = require('./services/zepraserch_quiry');
const SearchService = require('./services/SearchService');
const ModelManager = require('./models/ModelManager');
const AnalyticsService = require('./services/analyticsService');
const MonitoringService = require('./services/monitoringService');

class ZeppaAPIGateway {
    constructor() {
        this.app = express();
        this.port = process.env.API_GATEWAY_PORT || 6339;
        this.searchService = null;
        this.modelManager = null;
        this.analyticsService = null;
        this.monitoringService = null;
        
        this.setupMiddleware();
        this.setupRoutes();
        this.initializeServices();
    }

    setupMiddleware() {
        // Security middleware
        this.app.use(helmet({
            contentSecurityPolicy: {
                directives: {
                    defaultSrc: ["'self'"],
                    styleSrc: ["'self'", "'unsafe-inline'"],
                    scriptSrc: ["'self'"],
                    imgSrc: ["'self'", "data:", "https:"],
                    connectSrc: ["'self'", "ws:", "wss:"]
                }
            }
        }));

        // CORS configuration
        this.app.use(cors({
            origin: [
                'http://localhost:3000',
                'http://localhost:4000',
                'http://localhost:4562',
                'http://localhost:6041',
                'http://localhost:4045',
                'http://127.0.0.1:6041',
                'http://127.0.0.1:4045',
                process.env.FRONTEND_URL
            ].filter(Boolean),
            credentials: true,
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key', 'X-User-ID', 'X-Session-ID']
        }));

        // Rate limiting
        const apiLimiter = rateLimit({
            windowMs: 15 * 60 * 1000, // 15 minutes
            max: 100, // limit each IP to 100 requests per windowMs
            message: {
                error: 'Too many requests from this IP, please try again later.',
                retryAfter: '15 minutes'
            },
            standardHeaders: true,
            legacyHeaders: false
        });

        const searchLimiter = rateLimit({
            windowMs: 1 * 60 * 1000, // 1 minute
            max: 30, // limit each IP to 30 search requests per minute
            message: {
                error: 'Too many search requests, please slow down.',
                retryAfter: '1 minute'
            }
        });

        this.app.use('/api/v1/', apiLimiter);
        this.app.use('/api/v1/search', searchLimiter);

        // Body parsing
        this.app.use(express.json({ limit: '10mb' }));
        this.app.use(express.urlencoded({ extended: true }));

        // Request logging
        this.app.use((req, res, next) => {
            console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - ${req.ip}`);
            next();
        });
    }

    setupRoutes() {
        // Health check
        this.app.get('/health', (req, res) => {
            res.status(200).json({
                status: 'healthy',
                timestamp: new Date().toISOString(),
                version: '2.0.0',
                gateway: 'advanced',
                services: {
                    search: !!this.searchService,
                    database: !!this.modelManager,
                    analytics: !!this.analyticsService,
                    monitoring: !!this.monitoringService
                }
            });
        });

        // API Documentation
        this.app.get('/api/docs', (req, res) => {
            res.json({
                title: 'Zeppa Search Engine API',
                version: '2.0.0',
                description: 'API gateway for Zeppa Search Engine with C++ integration',
                endpoints: {
                    search: {
                        'GET /api/v1/search/query': 'Perform a search query',
                        'GET /api/v1/search/suggest': 'Get search suggestions',
                        'GET /api/v1/search/autocomplete': 'Get autocomplete suggestions',
                        'POST /api/v1/search/filter': 'Filtered search with filters',
                        'GET /api/v1/search/similar/:id': 'Find similar documents'
                    },
                    analytics: {
                        'GET /api/v1/analytics/search': 'Search analytics',
                        'GET /api/v1/analytics/performance': 'Performance metrics',
                        'GET /api/v1/analytics/trending': 'Trending searches'
                    },
                    admin: {
                        'GET /api/v1/admin/stats': 'System statistics',
                        'POST /api/v1/admin/crawl': 'Start crawling',
                        'GET /api/v1/admin/index': 'Index statistics'
                    },
                    cpp: {
                        'POST /api/v1/cpp/process': 'Process with C++ engine',
                        'GET /api/v1/cpp/status': 'C++ engine status'
                    }
                }
            });
        });

        // Search API Routes
        this.setupSearchRoutes();
        
        // Analytics API Routes
        this.setupAnalyticsRoutes();
        
        // Admin API Routes
        this.setupAdminRoutes();
        
        // C++ Integration Routes
        this.setupCppRoutes();

        // 404 handler
        this.app.use('*', (req, res) => {
            res.status(404).json({
                error: 'Endpoint not found',
                requestedUrl: req.originalUrl,
                method: req.method,
                availableEndpoints: '/api/docs'
            });
        });

        // Error handling
        this.app.use((err, req, res, next) => {
            console.error('API Gateway Error:', err);
            res.status(500).json({
                error: 'Internal server error',
                message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
                timestamp: new Date().toISOString()
            });
        });
    }

    setupSearchRoutes() {
        const searchRouter = express.Router();

        // Search query endpoint
        searchRouter.get('/query', async (req, res) => {
            try {
                const { q, page = 1, limit = 10, filters, type = 'all' } = req.query;
                const userId = req.headers['x-user-id'];
                const sessionId = req.headers['x-session-id'];

                if (!q || q.trim().length < 2) {
                    return res.status(400).json({
                        error: 'Query must be at least 2 characters long'
                    });
                }

                const results = await this.searchService.search({
                    query: q.trim(),
                    page: parseInt(page),
                    limit: Math.min(parseInt(limit), 50),
                    type,
                    userId,
                    sessionId
                });

                // Record analytics
                if (this.analyticsService) {
                    this.analyticsService.recordSearch(q, results, Date.now(), userId);
                }

                res.json({
                    success: true,
                    data: results,
                    meta: {
                        query: q,
                        page: parseInt(page),
                        limit: parseInt(limit),
                        total: results.total,
                        latency: results.latency
                    }
                });

            } catch (error) {
                console.error('Search error:', error);
                res.status(500).json({
                    error: 'Search failed',
                    message: error.message
                });
            }
        });

        // Search suggestions
        searchRouter.get('/suggest', async (req, res) => {
            try {
                const { prefix } = req.query;
                
                if (!prefix || prefix.length < 2) {
                    return res.json({ suggestions: [] });
                }

                const suggestions = await this.searchService.getSuggestions(prefix);
                res.json({ suggestions });
            } catch (error) {
                res.status(500).json({ error: 'Failed to get suggestions' });
            }
        });

        // Autocomplete
        searchRouter.get('/autocomplete', async (req, res) => {
            try {
                const { q } = req.query;
                
                if (!q || q.length < 2) {
                    return res.json({ completions: [] });
                }

                // Get trending searches that match the query
                const trending = await this.getTrendingSearches();
                const completions = trending
                    .filter(item => item.query.toLowerCase().includes(q.toLowerCase()))
                    .slice(0, 5)
                    .map(item => item.query);

                res.json({ completions });
            } catch (error) {
                res.status(500).json({ error: 'Autocomplete failed' });
            }
        });

        // Filtered search (was advanced)
        searchRouter.post('/filter', async (req, res) => {
            try {
                const { query, filters = {}, page = 1, limit = 10 } = req.body;
                const userId = req.headers['x-user-id'];

                if (!query) {
                    return res.status(400).json({ error: 'Query is required' });
                }

                const results = await this.searchService.search({
                    query,
                    page: parseInt(page),
                    limit: Math.min(parseInt(limit), 50),
                    type: filters.category || 'all',
                    userId
                });

                // Apply additional filters
                let filteredResults = results.results;
                
                if (filters.onlyEducational) {
                    filteredResults = filteredResults.filter(r => r.isEducational);
                }
                
                if (filters.minScore) {
                    filteredResults = filteredResults.filter(r => (r.score || 0) >= filters.minScore);
                }

                res.json({
                    success: true,
                    data: {
                        ...results,
                        results: filteredResults
                    }
                });

            } catch (error) {
                res.status(500).json({ error: 'Filtered search failed' });
            }
        });

        // Find similar documents
        searchRouter.get('/similar/:id', async (req, res) => {
            try {
                const { id } = req.params;
                const { limit = 5 } = req.query;

                // This would require document ID lookup - simplified for now
                res.json({
                    success: true,
                    data: {
                        similar: [],
                        originalId: id
                    }
                });
            } catch (error) {
                res.status(500).json({ error: 'Similar search failed' });
            }
        });

        this.app.use('/api/v1/search', searchRouter);
    }

    setupAnalyticsRoutes() {
        const analyticsRouter = express.Router();

        // Search analytics
        analyticsRouter.get('/search', async (req, res) => {
            try {
                const { days = 7 } = req.query;
                const analytics = await this.analyticsService.getSearchAnalytics(parseInt(days));
                res.json({ success: true, data: analytics });
            } catch (error) {
                res.status(500).json({ error: 'Analytics failed' });
            }
        });

        // Performance analytics
        analyticsRouter.get('/performance', async (req, res) => {
            try {
                const { days = 7 } = req.query;
                const performance = await this.analyticsService.getPerformanceAnalytics(parseInt(days));
                res.json({ success: true, data: performance });
            } catch (error) {
                res.status(500).json({ error: 'Performance analytics failed' });
            }
        });

        // Trending searches
        analyticsRouter.get('/trending', async (req, res) => {
            try {
                const trending = await this.getTrendingSearches();
                res.json({ success: true, data: trending });
            } catch (error) {
                res.status(500).json({ error: 'Trending analytics failed' });
            }
        });

        this.app.use('/api/v1/analytics', analyticsRouter);
    }

    setupAdminRoutes() {
        const adminRouter = express.Router();

        // Authentication middleware for admin routes
        const authenticateAdmin = (req, res, next) => {
            const apiKey = req.headers['x-api-key'];
            if (!apiKey || apiKey !== process.env.ADMIN_API_KEY) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
            next();
        };

        // System statistics
        adminRouter.get('/stats', authenticateAdmin, async (req, res) => {
            try {
                const stats = await this.getSystemStats();
                res.json({ success: true, data: stats });
            } catch (error) {
                res.status(500).json({ error: 'Failed to get stats' });
            }
        });

        // Start crawling
        adminRouter.post('/crawl', authenticateAdmin, async (req, res) => {
            try {
                const { urls, options = {} } = req.body;
                
                if (!urls || !Array.isArray(urls)) {
                    return res.status(400).json({ error: 'URLs array is required' });
                }

                // Start crawling in background
                this.startCrawling(urls, options);
                
                res.json({ 
                    success: true, 
                    message: 'Crawling started',
                    urls: urls.length
                });
            } catch (error) {
                res.status(500).json({ error: 'Failed to start crawling' });
            }
        });

        // Index statistics
        adminRouter.get('/index', authenticateAdmin, async (req, res) => {
            try {
                const stats = await this.searchService.getStats();
                res.json({ success: true, data: stats });
            } catch (error) {
                res.status(500).json({ error: 'Failed to get index stats' });
            }
        });

        this.app.use('/api/v1/admin', adminRouter);
    }

    setupCppRoutes() {
        const cppRouter = express.Router();

        // Process with C++ engine
        cppRouter.post('/process', async (req, res) => {
            try {
                const { data, operation = 'search' } = req.body;
                
                if (!data) {
                    return res.status(400).json({ error: 'Data is required' });
                }

                const result = await this.processWithCpp(data, operation);
                res.json({ success: true, data: result });
            } catch (error) {
                res.status(500).json({ error: 'C++ processing failed' });
            }
        });

        // C++ engine status
        cppRouter.get('/status', async (req, res) => {
            try {
                const status = await this.getCppEngineStatus();
                res.json({ success: true, data: status });
            } catch (error) {
                res.status(500).json({ error: 'Failed to get C++ status' });
            }
        });

        this.app.use('/api/v1/cpp', cppRouter);
    }

    async initializeServices() {
        try {
            console.log('Initializing Zeppa API Gateway services...');

            // Initialize search service
            this.searchService = new RealSearchService();
            console.log('Search service initialized');

            // Initialize analytics service
            this.analyticsService = new AnalyticsService();
            console.log('Analytics service initialized');

            // Initialize monitoring service
            this.monitoringService = new MonitoringService();
            await this.monitoringService.connect();
            console.log('Monitoring service initialized');

            console.log('All services initialized successfully');
        } catch (error) {
            console.error('Failed to initialize services:', error);
        }
    }

    async getTrendingSearches() {
        try {
            if (this.modelManager) {
                return await this.modelManager.getTrendingQueries(10);
            }
            return [];
        } catch (error) {
            console.warn('Failed to get trending searches:', error.message);
            return [];
        }
    }

    async getSystemStats() {
        const stats = {
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            search: await this.searchService.getStats(),
            monitoring: await this.monitoringService.getSystemMetrics()
        };

        return stats;
    }

    async startCrawling(urls, options) {
        try {
            console.log(`Starting crawling of ${urls.length} URLs...`);
            
            // Start crawling in background
            for (const url of urls) {
                this.searchService.webCrawler.addToQueue(url, 0);
            }
            
            console.log('Crawling queued successfully');
        } catch (error) {
            console.error('Failed to start crawling:', error);
        }
    }

    async processWithCpp(data, operation) {
        return new Promise((resolve, reject) => {
            const cppProcess = spawn('./cpp_crawler/build_enhanced/Release/zeppa_search_service.exe', [
                '--operation', operation,
                '--data', JSON.stringify(data)
            ]);

            let output = '';
            let error = '';

            cppProcess.stdout.on('data', (data) => {
                output += data.toString();
            });

            cppProcess.stderr.on('data', (data) => {
                error += data.toString();
            });

            cppProcess.on('close', (code) => {
                if (code === 0) {
                    try {
                        const result = JSON.parse(output);
                        resolve(result);
                    } catch (e) {
                        resolve({ output, processed: true });
                    }
                } else {
                    reject(new Error(`C++ process failed: ${error}`));
                }
            });
        });
    }

    async getCppEngineStatus() {
        try {
            const cppPath = './cpp_crawler/build_enhanced/Release/zeppa_search_service.exe';
            const exists = fs.existsSync(cppPath);
            
            return {
                available: exists,
                path: cppPath,
                lastCheck: new Date().toISOString()
            };
        } catch (error) {
            return {
                available: false,
                error: error.message,
                lastCheck: new Date().toISOString()
            };
        }
    }

    start() {
        this.app.listen(this.port, () => {
            console.log(`Zeppa API Gateway running on port ${this.port}`);
            console.log(`Health check: http://localhost:${this.port}/health`);
            console.log(`API docs: http://localhost:${this.port}/api/docs`);
            console.log(`Search API: http://localhost:${this.port}/api/v1/search`);
            console.log(`Analytics: http://localhost:${this.port}/api/v1/analytics`);
            console.log(`Admin: http://localhost:${this.port}/api/v1/admin`);
            console.log(`C++ Integration: http://localhost:${this.port}/api/v1/cpp`);
        });
    }
}

// Start the API Gateway
const gateway = new ZeppaAPIGateway();
gateway.start();

module.exports = ZeppaAPIGateway; 