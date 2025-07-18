const express = require('express');
const router = express.Router();
const AnalyticsService = require('../services/analyticsService');

const analyticsService = new AnalyticsService();

// Get search analytics
router.get('/search', async (req, res) => {
    try {
        const { days = 7 } = req.query;
        const analytics = await analyticsService.getSearchAnalytics(parseInt(days));
        
        res.json({
            success: true,
            analytics: analytics,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Search analytics error:', error);
        res.status(500).json({ 
            error: 'Failed to get search analytics',
            message: error.message 
        });
    }
});

// Get performance analytics
router.get('/performance', async (req, res) => {
    try {
        const { days = 7 } = req.query;
        const analytics = await analyticsService.getPerformanceAnalytics(parseInt(days));
        
        res.json({
            success: true,
            analytics: analytics,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Performance analytics error:', error);
        res.status(500).json({ 
            error: 'Failed to get performance analytics',
            message: error.message 
        });
    }
});

// Get trending analytics
router.get('/trending', async (req, res) => {
    try {
        const analytics = await analyticsService.getTrendingAnalytics();
        
        res.json({
            success: true,
            analytics: analytics,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Trending analytics error:', error);
        res.status(500).json({ 
            error: 'Failed to get trending analytics',
            message: error.message 
        });
    }
});

// Get system health analytics
router.get('/health', async (req, res) => {
    try {
        const analytics = await analyticsService.getSystemHealthAnalytics();
        
        res.json({
            success: true,
            analytics: analytics,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Health analytics error:', error);
        res.status(500).json({ 
            error: 'Failed to get health analytics',
            message: error.message 
        });
    }
});

// Get daily search spike (counts per day)
router.get('/daily-search-counts', async (req, res) => {
    try {
        const days = parseInt(req.query.days) || 30;
        const dailyCounts = await analyticsService.getDailySearchCounts(days);
        res.json({
            success: true,
            dailyCounts,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Daily search counts error:', error);
        res.status(500).json({
            error: 'Failed to get daily search counts',
            message: error.message
        });
    }
});

// Get user analytics
router.get('/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const analytics = await analyticsService.getUserAnalytics(userId);
        
        res.json({
            success: true,
            analytics: analytics,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('User analytics error:', error);
        res.status(500).json({ 
            error: 'Failed to get user analytics',
            message: error.message 
        });
    }
});

// Record search event
router.post('/record/search', async (req, res) => {
    try {
        const { query, results, latency, userId, userAgent } = req.body;
        
        if (!query) {
            return res.status(400).json({ error: 'Query is required' });
        }
        
        const searchData = await analyticsService.recordSearch(
            query, 
            results, 
            latency || 0, 
            userId, 
            userAgent
        );
        
        res.json({
            success: true,
            data: searchData,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Record search error:', error);
        res.status(500).json({ 
            error: 'Failed to record search',
            message: error.message 
        });
    }
});

// Record click event
router.post('/record/click', async (req, res) => {
    try {
        const { query, url, userId, position } = req.body;
        
        if (!query || !url) {
            return res.status(400).json({ error: 'Query and URL are required' });
        }
        
        const clickData = await analyticsService.recordClick(query, url, userId, position);
        
        res.json({
            success: true,
            data: clickData,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Record click error:', error);
        res.status(500).json({ 
            error: 'Failed to record click',
            message: error.message 
        });
    }
});

// Record performance event
router.post('/record/performance', async (req, res) => {
    try {
        const { operation, duration, success, error } = req.body;
        
        if (!operation || duration === undefined) {
            return res.status(400).json({ error: 'Operation and duration are required' });
        }
        
        const performanceData = await analyticsService.recordPerformance(
            operation, 
            duration, 
            success !== false, 
            error
        );
        
        res.json({
            success: true,
            data: performanceData,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Record performance error:', error);
        res.status(500).json({ 
            error: 'Failed to record performance',
            message: error.message 
        });
    }
});

// Record error event
router.post('/record/error', async (req, res) => {
    try {
        const { error, context } = req.body;
        
        if (!error || !error.message) {
            return res.status(400).json({ error: 'Error object with message is required' });
        }
        
        const errorData = await analyticsService.recordError(error, context || {});
        
        res.json({
            success: true,
            data: errorData,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Record error event error:', error);
        res.status(500).json({ 
            error: 'Failed to record error event',
            message: error.message 
        });
    }
});

// Export analytics data
router.get('/export', async (req, res) => {
    try {
        const { format = 'json' } = req.query;
        
        if (!['json', 'csv'].includes(format)) {
            return res.status(400).json({ error: 'Format must be json or csv' });
        }
        
        const data = await analyticsService.exportAnalytics(format);
        
        if (format === 'csv') {
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename="analytics-${new Date().toISOString().split('T')[0]}.csv"`);
            res.send(data);
        } else {
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Content-Disposition', `attachment; filename="analytics-${new Date().toISOString().split('T')[0]}.json"`);
            res.json(data);
        }
    } catch (error) {
        console.error('Export analytics error:', error);
        res.status(500).json({ 
            error: 'Failed to export analytics',
            message: error.message 
        });
    }
});

// Get analytics summary
router.get('/summary', async (req, res) => {
    try {
        const [searchAnalytics, performanceAnalytics, trendingAnalytics, healthAnalytics] = await Promise.all([
            analyticsService.getSearchAnalytics(7),
            analyticsService.getPerformanceAnalytics(7),
            analyticsService.getTrendingAnalytics(),
            analyticsService.getSystemHealthAnalytics()
        ]);
        
        const summary = {
            search: {
                totalSearches: searchAnalytics.totalSearches,
                successRate: searchAnalytics.successRate,
                averageLatency: searchAnalytics.averageLatency,
                educationalContentRate: searchAnalytics.educationalContentRate
            },
            performance: {
                totalOperations: performanceAnalytics.totalOperations,
                overallSuccessRate: performanceAnalytics.overallSuccessRate
            },
            trending: {
                totalTrendingQueries: trendingAnalytics.totalTrendingQueries
            },
            health: {
                systemStatus: healthAnalytics.systemStatus,
                errorRate: healthAnalytics.errorRate,
                averageResponseTime: healthAnalytics.averageResponseTime
            },
            timestamp: new Date().toISOString()
        };
        
        res.json({
            success: true,
            summary: summary
        });
    } catch (error) {
        console.error('Analytics summary error:', error);
        res.status(500).json({ 
            error: 'Failed to get analytics summary',
            message: error.message 
        });
    }
});

// Get real-time metrics
router.get('/realtime', async (req, res) => {
    try {
        const now = new Date();
        const lastHour = new Date(now.getTime() - 60 * 60 * 1000);
        
        // Get recent data
        const recentSearches = analyticsService.analytics.searches.filter(
            search => new Date(search.timestamp) >= lastHour
        );
        
        const recentErrors = analyticsService.analytics.errors.filter(
            error => new Date(error.timestamp) >= lastHour
        );
        
        const realtimeMetrics = {
            searchesLastHour: recentSearches.length,
            errorsLastHour: recentErrors.length,
            averageLatencyLastHour: recentSearches.length > 0 ? 
                recentSearches.reduce((sum, s) => sum + s.latency, 0) / recentSearches.length : 0,
            activeUsers: analyticsService.analytics.userSessions.size,
            systemStatus: analyticsService.calculateSystemStatus(recentErrors, recentSearches),
            timestamp: new Date().toISOString()
        };
        
        res.json({
            success: true,
            metrics: realtimeMetrics
        });
    } catch (error) {
        console.error('Real-time metrics error:', error);
        res.status(500).json({ 
            error: 'Failed to get real-time metrics',
            message: error.message 
        });
    }
});

module.exports = router; 