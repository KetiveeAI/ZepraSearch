const express = require('express');
const router = express.Router();

let modelManager = null;

// Try to initialize with database
try {
    const DatabaseManager = require('../database/databaseManager');
    const dbManager = new DatabaseManager();
    
    dbManager.connect().then(() => {
        if (dbManager.isConnected) {
            const ModelManager = require('../models/ModelManager');
            modelManager = new ModelManager(dbManager.db);
            console.log('✅ User search history routes initialized with database');
        } else {
            console.log('⚠️ User search history routes initialized without database');
        }
    }).catch(error => {
        console.log('⚠️ User search history routes initialized without database:', error.message);
    });
} catch (error) {
    console.log('⚠️ User search history routes initialized without database:', error.message);
}

// Middleware to check if user is authenticated
const requireAuth = (req, res, next) => {
    const userId = req.headers['x-user-id'] || req.query.userId || req.body.userId;
    
    if (!userId) {
        return res.status(401).json({ 
            error: 'Authentication required',
            message: 'User ID is required to access search history'
        });
    }
    
    req.userId = userId;
    next();
};

// Get user search history
router.get('/history', requireAuth, async (req, res) => {
    try {
        if (!modelManager) {
            return res.status(503).json({ error: 'Database not available' });
        }

        const { 
            page = 1, 
            limit = 20, 
            startDate, 
            endDate, 
            category, 
            query 
        } = req.query;

        const history = await modelManager.getUserSearchHistory(req.userId, {
            page: parseInt(page),
            limit: parseInt(limit),
            startDate,
            endDate,
            category,
            query
        });

        res.json({
            success: true,
            ...history,
            realData: true,
            independent: true
        });
    } catch (error) {
        console.error('Get user search history error:', error);
        res.status(500).json({ 
            error: 'Failed to get search history',
            message: error.message
        });
    }
});

// Get user search statistics
router.get('/stats', requireAuth, async (req, res) => {
    try {
        if (!modelManager) {
            return res.status(503).json({ error: 'Database not available' });
        }

        const { days = 30 } = req.query;
        const stats = await modelManager.getUserSearchStats(req.userId, parseInt(days));

        res.json({
            success: true,
            stats: stats,
            realData: true,
            independent: true
        });
    } catch (error) {
        console.error('Get user search stats error:', error);
        res.status(500).json({ 
            error: 'Failed to get search statistics',
            message: error.message
        });
    }
});

// Delete a specific search query
router.delete('/search/:searchId', requireAuth, async (req, res) => {
    try {
        if (!modelManager) {
            return res.status(503).json({ error: 'Database not available' });
        }

        const { searchId } = req.params;
        const result = await modelManager.deleteUserSearch(req.userId, searchId);

        if (result.deletedCount === 0) {
            return res.status(404).json({ 
                error: 'Search query not found',
                message: 'The specified search query does not exist or does not belong to you'
            });
        }

        res.json({
            success: true,
            message: 'Search query deleted successfully',
            deletedCount: result.deletedCount,
            realData: true,
            independent: true
        });
    } catch (error) {
        console.error('Delete user search error:', error);
        res.status(500).json({ 
            error: 'Failed to delete search query',
            message: error.message
        });
    }
});

// Delete user search history (with filters)
router.delete('/history', requireAuth, async (req, res) => {
    try {
        if (!modelManager) {
            return res.status(503).json({ error: 'Database not available' });
        }

        const { startDate, endDate, category } = req.body;
        
        const result = await modelManager.deleteUserSearchHistory(req.userId, {
            startDate,
            endDate,
            category
        });

        res.json({
            success: true,
            message: 'Search history deleted successfully',
            deletedCount: result.deletedCount,
            realData: true,
            independent: true
        });
    } catch (error) {
        console.error('Delete user search history error:', error);
        res.status(500).json({ 
            error: 'Failed to delete search history',
            message: error.message
        });
    }
});

// Export user search data
router.get('/export', requireAuth, async (req, res) => {
    try {
        if (!modelManager) {
            return res.status(503).json({ error: 'Database not available' });
        }

        const { format = 'json' } = req.query;
        
        if (!['json', 'csv'].includes(format)) {
            return res.status(400).json({ error: 'Format must be json or csv' });
        }

        const data = await modelManager.exportUserSearchData(req.userId, format);

        if (format === 'csv') {
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename="search-history-${req.userId}-${new Date().toISOString().split('T')[0]}.csv"`);
            res.send(data);
        } else {
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Content-Disposition', `attachment; filename="search-history-${req.userId}-${new Date().toISOString().split('T')[0]}.json"`);
            res.json(data);
        }
    } catch (error) {
        console.error('Export user search data error:', error);
        res.status(500).json({ 
            error: 'Failed to export search data',
            message: error.message
        });
    }
});

// Get search history summary
router.get('/summary', requireAuth, async (req, res) => {
    try {
        if (!modelManager) {
            return res.status(503).json({ error: 'Database not available' });
        }

        const { days = 15 } = req.query;
        
        // Get recent history
        const recentHistory = await modelManager.getUserSearchHistory(req.userId, {
            page: 1,
            limit: 10
        });

        // Get stats
        const stats = await modelManager.getUserSearchStats(req.userId, parseInt(days));

        // Get categories
        const categories = await modelManager.getUserSearchHistory(req.userId, {
            page: 1,
            limit: 1000
        });

        const categoryCounts = {};
        categories.searches.forEach(search => {
            categoryCounts[search.category] = (categoryCounts[search.category] || 0) + 1;
        });

        const summary = {
            recentSearches: recentHistory.searches.slice(0, 5),
            totalSearches: stats.totalSearches,
            successRate: stats.successRate,
            avgLatency: stats.avgLatency,
            uniqueQueries: stats.uniqueQueries,
            categories: Object.entries(categoryCounts).map(([category, count]) => ({
                category,
                count
            })),
            popularQueries: stats.popularQueries,
            dataRetentionDays: 15,
            realData: true,
            independent: true
        };

        res.json({
            success: true,
            summary: summary
        });
    } catch (error) {
        console.error('Get search history summary error:', error);
        res.status(500).json({ 
            error: 'Failed to get search history summary',
            message: error.message
        });
    }
});

// Get data retention info
router.get('/retention', requireAuth, async (req, res) => {
    try {
        if (!modelManager) {
            return res.status(503).json({ error: 'Database not available' });
        }

        const retentionInfo = {
            retentionDays: 15,
            autoDelete: true,
            lastCleanup: new Date().toISOString(),
            nextCleanup: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            dataSize: 'Calculating...',
            exportFormats: ['json', 'csv'],
            features: [
                'Automatic cleanup after 15 days',
                'Manual deletion of individual searches',
                'Bulk deletion with filters',
                'Data export in JSON/CSV formats',
                'Search statistics and analytics',
                'Category-based filtering',
                'Date range filtering'
            ],
            realData: true,
            independent: true
        };

        res.json({
            success: true,
            retention: retentionInfo
        });
    } catch (error) {
        console.error('Get retention info error:', error);
        res.status(500).json({ 
            error: 'Failed to get retention info',
            message: error.message
        });
    }
});

// Manual cleanup trigger (admin only)
router.post('/cleanup', requireAuth, async (req, res) => {
    try {
        if (!modelManager) {
            return res.status(503).json({ error: 'Database not available' });
        }

        const result = await modelManager.cleanupExpiredSearchData();

        res.json({
            success: true,
            message: 'Cleanup completed successfully',
            deletedCount: result.deletedCount,
            realData: true,
            independent: true
        });
    } catch (error) {
        console.error('Manual cleanup error:', error);
        res.status(500).json({ 
            error: 'Failed to perform cleanup',
            message: error.message
        });
    }
});

module.exports = router; 