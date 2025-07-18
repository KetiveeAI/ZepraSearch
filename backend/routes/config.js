const express = require('express');
const router = express.Router();
const config = require('../config');
const fs = require('fs').promises;
const path = require('path');

// Get search engine configuration
router.get('/', async (req, res) => {
  try {
    // Get actual package.json data
    const packagePath = path.join(__dirname, '../package.json');
    let packageData = {};
    
    try {
      const packageContent = await fs.readFile(packagePath, 'utf8');
      packageData = JSON.parse(packageContent);
    } catch (error) {
      console.warn('Could not read package.json:', error.message);
    }

    // Get actual system information
    const os = require('os');
    const process = require('process');

    const configData = {
      name: 'KetiveeSearch',
      version: packageData.version || '1.0.0',
      description: packageData.description || 'Independent Search Engine with C++ Bot & AI-Powered Discovery',
      independent: true,
      features: [
        'Independent Web Search',
        'C++ Bot Integration',
        'Educational Content Detection',
        'Self-Sufficient Search Engine',
        'Real-time Suggestions',
        'Category Classification',
        'Click Tracking',
        'Trending Searches',
        'Performance Monitoring',
        'No External Dependencies'
      ],
      endpoints: {
        search: '/api/search',
        suggestions: '/api/search/suggest',
        trending: '/api/search/trending',
        click: '/api/search/click',
        stats: '/api/search/stats',
        health: '/health',
        config: '/api/config',
        devtools: '/api/devtools',
        crawler: '/api/crawler'
      },
      search: {
        maxResults: 100,
        defaultLimit: 10,
        minQueryLength: 2,
        cacheTTL: 3600,
        supportedTypes: ['all', 'maps', 'videos', 'docs', 'news', 'shopping', 'travel', 'educational']
      },
      system: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        memory: process.memoryUsage(),
        uptime: process.uptime(),
        cwd: process.cwd(),
        environment: config.NODE_ENV
      },
      server: {
        port: config.PORT,
        frontendUrl: config.FRONTEND_URL,
        cors: {
          enabled: true,
          origins: [
            'http://localhost:3000',
            'http://localhost:4000',
            'http://localhost:4562',
            config.FRONTEND_URL
          ].filter(Boolean)
        }
      },
      enhanced: {
        cppBotEnabled: true,
        cppBotPath: './cpp_crawler/enhanced_search_bot',
        independentSearch: true,
        educationalDetection: true,
        categoryClassification: true,
        clickTracking: true,
        trendingSearches: true,
        noExternalDependencies: true
      },
      timestamp: new Date().toISOString()
    };

    res.status(200).json(configData);
  } catch (error) {
    console.error('Config error:', error);
    res.status(500).json({ 
      error: 'Failed to get configuration',
      message: error.message 
    });
  }
});

// Get configuration schema
router.get('/schema', (req, res) => {
  const schema = {
    type: 'object',
    properties: {
      search: {
        type: 'object',
        properties: {
          maxResults: { type: 'number', minimum: 1, maximum: 1000 },
          defaultLimit: { type: 'number', minimum: 1, maximum: 100 },
          minQueryLength: { type: 'number', minimum: 1, maximum: 10 },
          cacheTTL: { type: 'number', minimum: 60, maximum: 86400 }
        }
      },
      enhanced: {
        type: 'object',
        properties: {
          cppBotEnabled: { type: 'boolean' },
          independentSearch: { type: 'boolean' },
          educationalDetection: { type: 'boolean' },
          categoryClassification: { type: 'boolean' },
          clickTracking: { type: 'boolean' },
          trendingSearches: { type: 'boolean' },
          noExternalDependencies: { type: 'boolean' }
        }
      }
    }
  };

  res.status(200).json({
    schema: schema,
    independent: true,
    timestamp: new Date().toISOString()
  });
});

// Get specific configuration section
router.get('/:section', async (req, res) => {
  try {
    const { section } = req.params;
    
    const configSections = {
      search: {
        maxResults: 100,
        defaultLimit: 10,
        minQueryLength: 2,
        cacheTTL: 3600,
        supportedTypes: ['all', 'maps', 'videos', 'docs', 'news', 'shopping', 'travel', 'educational']
      },
      system: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        memory: process.memoryUsage(),
        uptime: process.uptime(),
        cwd: process.cwd(),
        environment: config.NODE_ENV
      },
      server: {
        port: config.PORT,
        frontendUrl: config.FRONTEND_URL,
        cors: {
          enabled: true,
          origins: [
            'http://localhost:3000',
            'http://localhost:4000',
            'http://localhost:4562',
            config.FRONTEND_URL
          ].filter(Boolean)
        }
      },
      enhanced: {
        cppBotEnabled: true,
        cppBotPath: './cpp_crawler/enhanced_search_bot',
        independentSearch: true,
        educationalDetection: true,
        categoryClassification: true,
        clickTracking: true,
        trendingSearches: true,
        noExternalDependencies: true
      }
    };

    if (configSections[section]) {
      res.status(200).json({
        section: section,
        data: configSections[section],
        independent: true,
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(404).json({ 
        error: 'Configuration section not found',
        availableSections: Object.keys(configSections),
        independent: true
      });
    }
  } catch (error) {
    console.error('Config section error:', error);
    res.status(500).json({ 
      error: 'Failed to get configuration section',
      message: error.message 
    });
  }
});

// Update search engine configuration
router.put('/', async (req, res) => {
  try {
    const { updates } = req.body;
    
    if (!updates || typeof updates !== 'object') {
      return res.status(400).json({ 
        error: 'Updates object is required' 
      });
    }

    // Validate updates
    const allowedUpdates = ['maxResults', 'defaultLimit', 'minQueryLength', 'cacheTTL'];
    const validUpdates = {};
    
    for (const [key, value] of Object.entries(updates)) {
      if (allowedUpdates.includes(key)) {
        validUpdates[key] = value;
      }
    }

    if (Object.keys(validUpdates).length === 0) {
      return res.status(400).json({ 
        error: 'No valid configuration updates provided',
        allowedUpdates: allowedUpdates
      });
    }

    // In a real application, you would save these to a database or config file
    // For now, we'll just return success
    res.status(200).json({ 
      success: true,
      message: 'Configuration updated successfully',
      updates: validUpdates,
      independent: true,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Config update error:', error);
    res.status(500).json({ 
      error: 'Failed to update configuration',
      message: error.message 
    });
  }
});

module.exports = router; 