const express = require('express');
const router = express.Router();
const WebCrawlerService = require('../services/webCrawlerService');

const crawlerService = new WebCrawlerService();

// Start crawling with seed URLs
router.post('/start', async (req, res) => {
    try {
        const { seedUrls, options = {} } = req.body;
        
        if (!seedUrls || !Array.isArray(seedUrls) || seedUrls.length === 0) {
            return res.status(400).json({ 
                error: 'Seed URLs are required and must be an array' 
            });
        }

        console.log('🕷️ Starting crawler with URLs:', seedUrls);
        
        const results = await crawlerService.startCrawling(seedUrls, options);
        
        res.json({
            success: true,
            message: `Crawling completed. Crawled ${results.length} pages.`,
            results: results,
            stats: crawlerService.getCrawlerStats()
        });
    } catch (error) {
        console.error('Crawler error:', error);
        res.status(500).json({ 
            error: 'Crawling failed',
            message: error.message 
        });
    }
});

// Search in crawled content
router.get('/search', async (req, res) => {
    try {
        const { q: query, page = 1, limit = 10 } = req.query;
        
        if (!query || query.trim().length < 2) {
            return res.status(400).json({ error: 'Query too short' });
        }

        const results = await crawlerService.searchInCrawledContent(query.trim());
        
        // Paginate results
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedResults = results.slice(startIndex, endIndex);

        res.json({
            query: query,
            page: parseInt(page),
            total: results.length,
            pages: Math.ceil(results.length / limit),
            results: paginatedResults,
            source: 'crawled'
        });
    } catch (error) {
        console.error('Crawler search error:', error);
        res.status(500).json({ error: 'Search failed' });
    }
});

// Get crawler statistics
router.get('/stats', async (req, res) => {
    try {
        const stats = crawlerService.getCrawlerStats();
        res.json({
            stats: stats,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to get stats' });
    }
});

// Get crawled pages
router.get('/pages', async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const pages = Array.from(crawlerService.crawledPages.values());
        
        // Sort by crawl date (newest first)
        pages.sort((a, b) => new Date(b.crawledAt) - new Date(a.crawledAt));
        
        // Paginate
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedPages = pages.slice(startIndex, endIndex);

        res.json({
            pages: paginatedPages,
            total: pages.length,
            page: parseInt(page),
            pages: Math.ceil(pages.length / limit)
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to get pages' });
    }
});

// Clear crawler cache
router.delete('/clear', async (req, res) => {
    try {
        crawlerService.clearCache();
        res.json({
            success: true,
            message: 'Crawler cache cleared successfully'
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to clear cache' });
    }
});

// Get specific page data
router.get('/page/:url', async (req, res) => {
    try {
        const url = decodeURIComponent(req.params.url);
        const pageData = crawlerService.crawledPages.get(url);
        
        if (!pageData) {
            return res.status(404).json({ error: 'Page not found' });
        }

        res.json(pageData);
    } catch (error) {
        res.status(500).json({ error: 'Failed to get page data' });
    }
});

// Health check for crawler
router.get('/health', async (req, res) => {
    try {
        const stats = crawlerService.getCrawlerStats();
        res.json({
            status: 'OK',
            crawler: {
                totalPages: stats.totalPages,
                queueSize: stats.queueSize,
                visitedUrls: stats.visitedUrls
            },
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({ 
            status: 'ERROR',
            error: error.message 
        });
    }
});

module.exports = router; 