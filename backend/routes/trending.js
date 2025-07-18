const express = require('express');
const router = express.Router();
const { spawn } = require('child_process');
const path = require('path');

// In-memory trending data store (in production, this would be a database)
const trendingDataStore = {
  searches: new Map(),
  clicks: new Map(),
  categories: new Map()
};

// Initialize with empty data - no dummy data
const initializeTrendingData = () => {
  console.log('📊 Initializing trending data store with real data only');
  // No dummy data initialization - will be populated with real user searches
};

// Initialize trending data
initializeTrendingData();

// Record a search query
router.post('/record', async (req, res) => {
  try {
    const { query, category = 'general', userId = null } = req.body;
    
    if (!query || query.trim().length < 2) {
      return res.status(400).json({ error: 'Query too short' });
    }
    
    const normalizedQuery = query.trim().toLowerCase();
    const now = Date.now();
    
    // Record search
    if (trendingDataStore.searches.has(normalizedQuery)) {
      const existing = trendingDataStore.searches.get(normalizedQuery);
      existing.count++;
      existing.lastSearched = now;
      if (userId) {
        existing.users = existing.users || new Set();
        existing.users.add(userId);
      }
    } else {
      trendingDataStore.searches.set(normalizedQuery, {
        query: normalizedQuery,
        count: 1,
        category: category,
        firstSearched: now,
        lastSearched: now,
        users: userId ? new Set([userId]) : new Set()
      });
    }
    
    // Update category stats
    if (trendingDataStore.categories.has(category)) {
      const catStats = trendingDataStore.categories.get(category);
      catStats.count++;
      catStats.lastUpdated = now;
    } else {
      trendingDataStore.categories.set(category, {
        name: category,
        count: 1,
        firstSeen: now,
        lastUpdated: now
      });
    }
    
    res.json({ 
      success: true, 
      message: 'Search recorded',
      realData: true,
      independent: true
    });
  } catch (error) {
    console.error('Error recording search:', error);
    res.status(500).json({ 
      error: 'Failed to record search',
      message: error.message,
      realData: true,
      independent: true
    });
  }
});

// Get trending searches
router.get('/', async (req, res) => {
  try {
    const { period = 'all', category = 'all', limit = 10 } = req.query;
    
    let searches = Array.from(trendingDataStore.searches.values());
    
    // Filter by period
    if (period !== 'all') {
      const now = Date.now();
      const periodMs = {
        'hour': 60 * 60 * 1000,
        'day': 24 * 60 * 60 * 1000,
        'week': 7 * 24 * 60 * 60 * 1000,
        'month': 30 * 24 * 60 * 60 * 1000
      };
      
      if (periodMs[period]) {
        const cutoff = now - periodMs[period];
        searches = searches.filter(search => search.lastSearched >= cutoff);
      }
    }
    
    // Filter by category
    if (category !== 'all') {
      searches = searches.filter(search => search.category === category);
    }
    
    // Sort by count and limit
    searches.sort((a, b) => b.count - a.count);
    searches = searches.slice(0, parseInt(limit));
    
    // Format response
    const formattedSearches = searches.map(search => ({
      query: search.query,
      count: search.count,
      category: search.category,
      firstSearched: search.firstSearched,
      lastSearched: search.lastSearched,
      uniqueUsers: search.users ? search.users.size : 0
    }));
    
    res.json({
      success: true,
      trending: formattedSearches,
      period: period,
      category: category,
      total: formattedSearches.length,
      realData: true,
      independent: true,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error getting trending searches:', error);
    res.status(500).json({ 
      error: 'Failed to get trending searches',
      message: error.message,
      realData: true,
      independent: true
    });
  }
});

// Get trending categories
router.get('/categories', async (req, res) => {
  try {
    const categories = Array.from(trendingDataStore.categories.values());
    
    // Calculate percentages
    const totalSearches = categories.reduce((sum, cat) => sum + cat.count, 0);
    
    const formattedCategories = categories.map(category => ({
      name: category.name,
      count: category.count,
      percentage: totalSearches > 0 ? Math.round((category.count / totalSearches) * 100) : 0,
      firstSeen: category.firstSeen,
      lastUpdated: category.lastUpdated
    }));
    
    // Sort by count
    formattedCategories.sort((a, b) => b.count - a.count);
    
    res.json({
      success: true,
      categories: formattedCategories,
      totalSearches: totalSearches,
      realData: true,
      independent: true,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error getting trending categories:', error);
    res.status(500).json({ 
      error: 'Failed to get trending categories',
      message: error.message,
      realData: true,
      independent: true
    });
  }
});

// Get trending statistics
router.get('/stats', async (req, res) => {
  try {
    const searches = Array.from(trendingDataStore.searches.values());
    const categories = Array.from(trendingDataStore.categories.values());
    
    const totalSearches = searches.reduce((sum, search) => sum + search.count, 0);
    const uniqueQueries = searches.length;
    const uniqueCategories = categories.length;
    
    // Get most active users
    const userActivity = new Map();
    searches.forEach(search => {
      if (search.users) {
        search.users.forEach(userId => {
          userActivity.set(userId, (userActivity.get(userId) || 0) + 1);
        });
      }
    });
    
    const topUsers = Array.from(userActivity.entries())
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([userId, count]) => ({ userId, count }));
    
    res.json({
      success: true,
      stats: {
        totalSearches: totalSearches,
        uniqueQueries: uniqueQueries,
        uniqueCategories: uniqueCategories,
        topUsers: topUsers,
        mostSearchedQuery: searches.length > 0 ? searches[0].query : null,
        mostPopularCategory: categories.length > 0 ? categories[0].name : null
      },
      realData: true,
      independent: true,
      noMockData: true,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error getting trending stats:', error);
    res.status(500).json({ 
      error: 'Failed to get trending stats',
      message: error.message,
      realData: true,
      independent: true
    });
  }
});

// Clear trending data (for testing/reset purposes)
router.delete('/clear', async (req, res) => {
  try {
    trendingDataStore.searches.clear();
    trendingDataStore.clicks.clear();
    trendingDataStore.categories.clear();
    
    res.json({ 
      success: true, 
      message: 'Trending data cleared',
      realData: true,
      independent: true
    });
  } catch (error) {
    console.error('Error clearing trending data:', error);
    res.status(500).json({ 
      error: 'Failed to clear trending data',
      message: error.message,
      realData: true,
      independent: true
    });
  }
});

module.exports = router;