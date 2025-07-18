const express = require('express');
const router = express.Router();
const RealSearchService = require('../services/zepraserch_quiry');

// Initialize real search service with database connection
let realSearchService = null;
let modelManager = null;

// Try to initialize with database
try {
    const DatabaseManager = require('../database/databaseManager');
    const dbManager = new DatabaseManager();
    
    // Initialize database connection
    dbManager.connect().then(() => {
        if (dbManager.isConnected) {
            const ModelManager = require('../models/ModelManager');
            modelManager = new ModelManager(dbManager.db);
            realSearchService = new RealSearchService(dbManager.db);
            console.log('✅ Search service initialized with database');
        } else {
            realSearchService = new RealSearchService();
            console.log('⚠️ Search service initialized without database');
        }
    }).catch(error => {
        realSearchService = new RealSearchService();
        console.log('⚠️ Search service initialized without database:', error.message);
    });
} catch (error) {
    realSearchService = new RealSearchService();
    console.log('⚠️ Search service initialized without database:', error.message);
}

// Try to load the trending service
let trendingService = null;
try {
    trendingService = require('../services/trendingService');
} catch (error) {
    console.warn('Trending service not available:', error.message);
}

const clickCounts = new Map();

// Helper function to extract user info from request
const getUserInfo = (req) => {
    return {
        userId: req.headers['x-user-id'] || req.query.userId || null,
        sessionId: req.headers['x-session-id'] || req.query.sessionId || null,
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent')
    };
};

// Record a click event
router.post('/click', async (req, res) => {
    try {
        const { query, url, position } = req.body;
        if (!query || !url) return res.status(400).json({ error: 'Query and URL required' });
        
        const userInfo = getUserInfo(req);
        const key = `${query.toLowerCase()}|${url}`;
        clickCounts.set(key, (clickCounts.get(key) || 0) + 1);
        
        // Record click in database if available
        if (modelManager) {
            try {
                await modelManager.processClick(query, url, userInfo.userId, userInfo.sessionId, position);
            } catch (dbError) {
                console.warn('Failed to record click in database:', dbError.message);
            }
        }
        
        res.json({ 
            success: true,
            database_sync: !!modelManager
        });
    } catch (error) {
        console.error('Click recording error:', error);
        res.status(500).json({ error: 'Failed to record click' });
    }
});

// Get most clicked links for a query
router.get('/most-clicked', async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) return res.status(400).json({ error: 'Query required' });
        
        // Try to get from database first
        if (modelManager) {
            try {
                const searchResults = await modelManager.searchInDatabase(q, { limit: 10 });
                const results = searchResults.results
                    .sort((a, b) => (b.clickCount || 0) - (a.clickCount || 0))
                    .slice(0, 10)
                    .map(result => ({
                        url: result.url,
                        count: result.clickCount || 0,
                        title: result.title
                    }));
                
                return res.json(results);
            } catch (dbError) {
                console.warn('Failed to get clicked links from database:', dbError.message);
            }
        }
        
        // Fallback to in-memory storage
        const prefix = `${q.toLowerCase()}|`;
        const result = [];
        for (const [key, count] of clickCounts.entries()) {
            if (key.startsWith(prefix)) {
                result.push({ url: key.split('|')[1], count });
            }
        }
        result.sort((a, b) => b.count - a.count);
        res.json(result.slice(0, 10));
    } catch (error) {
        console.error('Most clicked error:', error);
        res.status(500).json({ error: 'Failed to get most clicked links' });
    }
});

// GET route for search (for frontend compatibility)
router.get('/', async (req, res) => {
    try {
        const { q: query, page = 1, limit = 10, type = 'all' } = req.query;
        
        if (!query || query.trim().length < 2) {
            return res.status(400).json({ error: 'Query too short' });
        }
        
        const userInfo = getUserInfo(req);
        
        // Record trending search if available
        if (trendingService) {
            try {
                await trendingService.recordSearch(query);
            } catch (error) {
                console.warn('Failed to record trending search:', error.message);
            }
        }
        
        // Use only real search service - no fallback to mock
        const results = await realSearchService.search({ 
            query: query.trim(), 
            page: parseInt(page), 
            limit: parseInt(limit),
            type: type,
            userId: userInfo.userId,
            sessionId: userInfo.sessionId
        });
        
        // Save user search query if user is logged in
        if (userInfo.userId && modelManager) {
            try {
                await modelManager.saveUserSearchQuery(userInfo.userId, query.trim(), {
                    sessionId: userInfo.sessionId,
                    ipAddress: userInfo.ipAddress,
                    userAgent: userInfo.userAgent,
                    resultsCount: results.results ? results.results.length : 0,
                    latency: results.latency || 0,
                    success: results.results && results.results.length > 0,
                    category: type,
                    results: results.results ? results.results.slice(0, 10) : []
                });
            } catch (dbError) {
                console.warn('Failed to save user search query:', dbError.message);
            }
        }
        
        res.json(results);
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ 
            error: 'Search failed', 
            message: error.message,
            independent: true,
            realData: true
        });
    }
});

router.post('/', async (req, res) => {
    try {
        const { query, page = 1, limit = 10, type = 'all' } = req.body;
        
        if (!query || query.trim().length < 2) {
            return res.status(400).json({ error: 'Query too short' });
        }
        
        const userInfo = getUserInfo(req);
        
        // Record trending search if available
        if (trendingService) {
            try {
                await trendingService.recordSearch(query);
            } catch (error) {
                console.warn('Failed to record trending search:', error.message);
            }
        }
        
        // Use only real search service - no fallback to mock
        const results = await realSearchService.search({ 
            query: query.trim(), 
            page: parseInt(page), 
            limit: parseInt(limit),
            type: type,
            userId: userInfo.userId,
            sessionId: userInfo.sessionId
        });
        
        // Save user search query if user is logged in
        if (userInfo.userId && modelManager) {
            try {
                await modelManager.saveUserSearchQuery(userInfo.userId, query.trim(), {
                    sessionId: userInfo.sessionId,
                    ipAddress: userInfo.ipAddress,
                    userAgent: userInfo.userAgent,
                    resultsCount: results.results ? results.results.length : 0,
                    latency: results.latency || 0,
                    success: results.results && results.results.length > 0,
                    category: type,
                    results: results.results ? results.results.slice(0, 10) : []
                });
            } catch (dbError) {
                console.warn('Failed to save user search query:', dbError.message);
            }
        }
        
        res.json(results);
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ 
            error: 'Search failed', 
            message: error.message,
            independent: true,
            realData: true
        });
    }
});

router.get('/suggest', async (req, res) => {
    try {
        const { q } = req.query;
        
        // Try to get suggestions from database first
        if (modelManager) {
            try {
                const suggestions = await modelManager.getQuerySuggestions(q || '', 5);
                return res.json(suggestions.map(s => s.query));
            } catch (dbError) {
                console.warn('Failed to get suggestions from database:', dbError.message);
            }
        }
        
        // Fallback to real search service for suggestions
        const suggestions = await realSearchService.getSuggestions(q || '');
        
        res.json(suggestions.map(s => typeof s === 'string' ? s : s.title));
    } catch (error) {
        console.error('Suggestion error:', error);
        res.status(500).json({ 
            error: 'Suggestion failed',
            message: error.message,
            independent: true,
            realData: true
        });
    }
});

router.get('/trending', async (req, res) => {
    try {
        const { limit = 10, period = 'all' } = req.query;
        
        // Try to get trending from database first
        if (modelManager) {
            try {
                const trending = await modelManager.getTrendingQueries(parseInt(limit), period);
                return res.json(trending);
            } catch (dbError) {
                console.warn('Failed to get trending from database:', dbError.message);
            }
        }
        
        // Fallback to trending service
        if (trendingService) {
            try {
                const trending = await trendingService.getTrending(parseInt(limit));
                
                // Format: [query1, score1, query2, score2...]
                const formatted = [];
                for (let i = 0; i < trending.length; i += 2) {
                    formatted.push({
                        query: trending[i],
                        score: parseInt(trending[i+1])
                    });
                }
                
                res.json(formatted);
            } catch (error) {
                console.warn('Real trending failed:', error.message);
                // Return empty array instead of mock data
                res.json([]);
            }
        } else {
            // Return empty array instead of mock data
            res.json([]);
        }
    } catch (error) {
        console.error('Trending error:', error);
        res.status(500).json({ 
            error: 'Trending failed',
            message: error.message,
            independent: true,
            realData: true
        });
    }
});

// New endpoint for search statistics
router.get('/stats', async (req, res) => {
    try {
        const stats = await realSearchService.getStats();
        
        res.json({
            ...stats,
            independent: true,
            realData: true,
            noMockData: true,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Stats error:', error);
        res.status(500).json({ 
            error: 'Stats failed',
            message: error.message,
            independent: true,
            realData: true
        });
    }
});

// New endpoint for user activity
router.get('/user/:userId/activity', async (req, res) => {
    try {
        const { userId } = req.params;
        const { page = 1, limit = 20, activityType } = req.query;
        
        if (!modelManager) {
            return res.status(503).json({ error: 'Database not available' });
        }
        
        const activity = await modelManager.getUserActivity(userId, {
            page: parseInt(page),
            limit: parseInt(limit),
            activityType
        });
        
        res.json(activity);
    } catch (error) {
        console.error('User activity error:', error);
        res.status(500).json({ 
            error: 'Failed to get user activity',
            message: error.message
        });
    }
});

// New endpoint for user statistics
router.get('/user/:userId/stats', async (req, res) => {
    try {
        const { userId } = req.params;
        const { days = 30 } = req.query;
        
        if (!modelManager) {
            return res.status(503).json({ error: 'Database not available' });
        }
        
        const stats = await modelManager.getUserActivityStats(userId, parseInt(days));
        
        res.json(stats);
    } catch (error) {
        console.error('User stats error:', error);
        res.status(500).json({ 
            error: 'Failed to get user stats',
            message: error.message
        });
    }
});

module.exports = router;
