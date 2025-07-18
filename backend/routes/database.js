const express = require('express');
const router = express.Router();

let modelManager = null;
let dbManager = null;

// Try to initialize database connection
try {
    const DatabaseManager = require('../database/databaseManager');
    const ModelManager = require('../models/ModelManager');
    
    dbManager = new DatabaseManager();
    dbManager.connect().then(() => {
        if (dbManager.isConnected) {
            modelManager = new ModelManager(dbManager.db);
            console.log('✅ Database routes initialized with database');
        } else {
            console.log('⚠️ Database routes initialized without database');
        }
    }).catch(error => {
        console.log('⚠️ Database routes initialized without database:', error.message);
    });
} catch (error) {
    console.log('⚠️ Database routes initialized without database:', error.message);
}

// Get database health status
router.get('/health', async (req, res) => {
    try {
        if (!dbManager) {
            return res.status(503).json({ 
                status: 'unavailable',
                error: 'Database manager not initialized'
            });
        }

        const health = await dbManager.healthCheck();
        res.json(health);
    } catch (error) {
        console.error('Database health check error:', error);
        res.status(500).json({ 
            status: 'error',
            error: error.message
        });
    }
});

// Get comprehensive database statistics
router.get('/stats', async (req, res) => {
    try {
        if (!modelManager) {
            return res.status(503).json({ 
                error: 'Database not available',
                message: 'Model manager not initialized'
            });
        }

        const stats = await modelManager.getComprehensiveStats();
        res.json(stats);
    } catch (error) {
        console.error('Database stats error:', error);
        res.status(500).json({ 
            error: 'Failed to get database stats',
            message: error.message
        });
    }
});

// Get search result statistics
router.get('/stats/search-results', async (req, res) => {
    try {
        if (!modelManager) {
            return res.status(503).json({ error: 'Database not available' });
        }

        const stats = await modelManager.getSearchResultStats();
        res.json(stats);
    } catch (error) {
        console.error('Search result stats error:', error);
        res.status(500).json({ 
            error: 'Failed to get search result stats',
            message: error.message
        });
    }
});

// Get search query statistics
router.get('/stats/search-queries', async (req, res) => {
    try {
        if (!modelManager) {
            return res.status(503).json({ error: 'Database not available' });
        }

        const stats = await modelManager.getSearchQueryStats();
        res.json(stats);
    } catch (error) {
        console.error('Search query stats error:', error);
        res.status(500).json({ 
            error: 'Failed to get search query stats',
            message: error.message
        });
    }
});

// Get crawler statistics
router.get('/stats/crawler', async (req, res) => {
    try {
        if (!modelManager) {
            return res.status(503).json({ error: 'Database not available' });
        }

        const stats = await modelManager.getCrawlerStats();
        res.json(stats);
    } catch (error) {
        console.error('Crawler stats error:', error);
        res.status(500).json({ 
            error: 'Failed to get crawler stats',
            message: error.message
        });
    }
});

// Get user activity statistics
router.get('/stats/user-activity', async (req, res) => {
    try {
        if (!modelManager) {
            return res.status(503).json({ error: 'Database not available' });
        }

        const { days = 30 } = req.query;
        const stats = await modelManager.getGlobalActivityStats(parseInt(days));
        res.json(stats);
    } catch (error) {
        console.error('User activity stats error:', error);
        res.status(500).json({ 
            error: 'Failed to get user activity stats',
            message: error.message
        });
    }
});

// Search in database
router.get('/search', async (req, res) => {
    try {
        if (!modelManager) {
            return res.status(503).json({ error: 'Database not available' });
        }

        const { q: query, page = 1, limit = 10, category, source, educationalOnly } = req.query;
        
        if (!query) {
            return res.status(400).json({ error: 'Query parameter required' });
        }

        const results = await modelManager.searchInDatabase(query, {
            page: parseInt(page),
            limit: parseInt(limit),
            category,
            source,
            educationalOnly: educationalOnly === 'true'
        });

        res.json(results);
    } catch (error) {
        console.error('Database search error:', error);
        res.status(500).json({ 
            error: 'Database search failed',
            message: error.message
        });
    }
});

// Get trending queries from database
router.get('/trending', async (req, res) => {
    try {
        if (!modelManager) {
            return res.status(503).json({ error: 'Database not available' });
        }

        const { limit = 10, period = 'all' } = req.query;
        const trending = await modelManager.getTrendingQueries(parseInt(limit), period);
        
        res.json(trending);
    } catch (error) {
        console.error('Database trending error:', error);
        res.status(500).json({ 
            error: 'Failed to get trending queries',
            message: error.message
        });
    }
});

// Get query suggestions from database
router.get('/suggestions', async (req, res) => {
    try {
        if (!modelManager) {
            return res.status(503).json({ error: 'Database not available' });
        }

        const { q: query, limit = 5 } = req.query;
        
        if (!query) {
            return res.status(400).json({ error: 'Query parameter required' });
        }

        const suggestions = await modelManager.getQuerySuggestions(query, parseInt(limit));
        res.json(suggestions.map(s => s.query));
    } catch (error) {
        console.error('Database suggestions error:', error);
        res.status(500).json({ 
            error: 'Failed to get suggestions',
            message: error.message
        });
    }
});

// Get educational content from database
router.get('/educational', async (req, res) => {
    try {
        if (!modelManager) {
            return res.status(503).json({ error: 'Database not available' });
        }

        const { limit = 20 } = req.query;
        const educational = await modelManager.getSearchResultModel().getEducationalContent(parseInt(limit));
        
        res.json(educational);
    } catch (error) {
        console.error('Educational content error:', error);
        res.status(500).json({ 
            error: 'Failed to get educational content',
            message: error.message
        });
    }
});

// Get trending results from database
router.get('/trending-results', async (req, res) => {
    try {
        if (!modelManager) {
            return res.status(503).json({ error: 'Database not available' });
        }

        const { limit = 10 } = req.query;
        const trending = await modelManager.getSearchResultModel().getTrendingResults(parseInt(limit));
        
        res.json(trending);
    } catch (error) {
        console.error('Trending results error:', error);
        res.status(500).json({ 
            error: 'Failed to get trending results',
            message: error.message
        });
    }
});

// Cleanup old data
router.post('/cleanup', async (req, res) => {
    try {
        if (!modelManager) {
            return res.status(503).json({ error: 'Database not available' });
        }

        const cleanup = await modelManager.cleanupOldData();
        
        res.json({
            success: true,
            cleanup: cleanup,
            message: 'Old data cleaned up successfully'
        });
    } catch (error) {
        console.error('Data cleanup error:', error);
        res.status(500).json({ 
            error: 'Failed to cleanup old data',
            message: error.message
        });
    }
});

// Get database collections info
router.get('/collections', async (req, res) => {
    try {
        if (!dbManager || !dbManager.isConnected) {
            return res.status(503).json({ error: 'Database not available' });
        }

        const collections = await dbManager.db.listCollections().toArray();
        const collectionStats = [];

        for (const collection of collections) {
            try {
                const count = await dbManager.db.collection(collection.name).countDocuments();
                collectionStats.push({
                    name: collection.name,
                    count: count
                });
            } catch (error) {
                collectionStats.push({
                    name: collection.name,
                    count: 'error',
                    error: error.message
                });
            }
        }

        res.json({
            collections: collectionStats,
            totalCollections: collections.length
        });
    } catch (error) {
        console.error('Collections info error:', error);
        res.status(500).json({ 
            error: 'Failed to get collections info',
            message: error.message
        });
    }
});

// Export data (basic implementation)
router.get('/export/:collection', async (req, res) => {
    try {
        if (!dbManager || !dbManager.isConnected) {
            return res.status(503).json({ error: 'Database not available' });
        }

        const { collection } = req.params;
        const { limit = 1000, format = 'json' } = req.query;

        const data = await dbManager.db.collection(collection)
            .find({})
            .limit(parseInt(limit))
            .toArray();

        if (format === 'csv') {
            // Simple CSV export
            const csv = data.map(item => 
                Object.values(item).join(',')
            ).join('\n');
            
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename="${collection}-${new Date().toISOString().split('T')[0]}.csv"`);
            res.send(csv);
        } else {
            res.json({
                collection: collection,
                count: data.length,
                data: data
            });
        }
    } catch (error) {
        console.error('Data export error:', error);
        res.status(500).json({ 
            error: 'Failed to export data',
            message: error.message
        });
    }
});

module.exports = router; 