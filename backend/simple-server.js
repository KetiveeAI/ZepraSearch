const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 6329;

// Middleware
app.use(cors({
    origin: ['http://localhost:6041', 'http://localhost:4045'],
    credentials: true
}));

app.use(express.json());

// Mock search results for testing
const mockSearchResults = [
    {
        title: "JavaScript Tutorial - W3Schools",
        url: "https://www.w3schools.com/js/",
        snippet: "Learn JavaScript with W3Schools' comprehensive tutorial. JavaScript is the programming language of the Web. JavaScript is easy to learn.",
        category: "educational",
        isEducational: true,
        score: 0.95
    },
    {
        title: "React Documentation",
        url: "https://react.dev/",
        snippet: "React is the library for web and native user interfaces. Build user interfaces out of individual pieces called components.",
        category: "docs",
        isEducational: true,
        score: 0.92
    },
    {
        title: "Python Programming Tutorial",
        url: "https://docs.python.org/3/tutorial/",
        snippet: "Python is an easy to learn, powerful programming language. It has efficient high-level data structures and a simple but effective approach to object-oriented programming.",
        category: "educational",
        isEducational: true,
        score: 0.89
    },
    {
        title: "Machine Learning Basics",
        url: "https://www.coursera.org/learn/machine-learning",
        snippet: "Learn the fundamentals of machine learning and how to apply various machine learning algorithms to real-world problems.",
        category: "educational",
        isEducational: true,
        score: 0.87
    },
    {
        title: "Web Development Guide",
        url: "https://developer.mozilla.org/en-US/docs/Learn",
        snippet: "Learn web development with MDN Web Docs. From beginner to advanced, find tutorials, references, and examples.",
        category: "docs",
        isEducational: true,
        score: 0.85
    }
];

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        version: '1.0.0-simple',
        environment: 'development',
        uptime: process.uptime(),
        message: 'Simple backend server is running'
    });
});

// Search endpoint
app.get('/api/search', (req, res) => {
    const { q: query, page = 1, limit = 10, type = 'all' } = req.query;
    
    if (!query || query.trim().length < 2) {
        return res.status(400).json({ 
            error: 'Query too short',
            message: 'Query must be at least 2 characters long'
        });
    }

    // Simulate processing time
    setTimeout(() => {
        // Filter results based on query
        let results = mockSearchResults.filter(result => 
            result.title.toLowerCase().includes(query.toLowerCase()) ||
            result.snippet.toLowerCase().includes(query.toLowerCase())
        );

        // Filter by type if specified
        if (type && type !== 'all') {
            results = results.filter(result => result.category === type);
        }

        // Paginate results
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + parseInt(limit);
        const paginatedResults = results.slice(startIndex, endIndex);

        res.json({
            query: query,
            originalQuery: query,
            page: parseInt(page),
            total: results.length,
            pages: Math.ceil(results.length / limit),
            results: paginatedResults,
            latency: '150ms',
            engines: {
                simple_backend: true,
                independent: true,
                realData: true
            },
            categories: {
                all: results.length,
                educational: results.filter(r => r.isEducational).length,
                docs: results.filter(r => r.category === 'docs').length
            },
            educationalContent: {
                detected: true,
                suggestions: [
                    'Try searching for "React tutorial"',
                    'Learn more about "JavaScript basics"',
                    'Explore "Python programming"'
                ]
            }
        });
    }, 150);
});

// Click tracking endpoint
app.post('/api/search/click', (req, res) => {
    const { query, url } = req.body;
    
    console.log(`Click tracked: Query="${query}", URL="${url}"`);
    
    res.json({
        success: true,
        message: 'Click recorded successfully'
    });
});

// Trending endpoint
app.get('/api/search/trending', (req, res) => {
    res.json([
        { query: 'JavaScript tutorial', score: 95 },
        { query: 'React development', score: 87 },
        { query: 'Python programming', score: 82 },
        { query: 'Machine learning', score: 78 },
        { query: 'Web design', score: 75 }
    ]);
});

// Suggestions endpoint
app.get('/api/search/suggest', (req, res) => {
    const { q: query } = req.query;
    
    const suggestions = [
        'JavaScript tutorial',
        'React development',
        'Python programming',
        'Machine learning',
        'Web design',
        'CSS styling',
        'HTML basics',
        'Node.js backend'
    ].filter(suggestion => 
        suggestion.toLowerCase().includes((query || '').toLowerCase())
    );

    res.json(suggestions.slice(0, 5));
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'Ketivee Search Engine - Simple Backend',
        version: '1.0.0-simple',
        endpoints: {
            health: '/health',
            search: '/api/search?q=query',
            trending: '/api/search/trending',
            suggestions: '/api/search/suggest?q=query',
            click: 'POST /api/search/click'
        },
        status: 'running'
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Endpoint not found',
        requestedUrl: req.originalUrl,
        availableEndpoints: [
            'GET /health',
            'GET /api/search?q=query',
            'GET /api/search/trending',
            'GET /api/search/suggest?q=query',
            'POST /api/search/click'
        ]
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Simple backend server running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`🔍 Search API: http://localhost:${PORT}/api/search?q=javascript`);
    console.log(`🌐 Frontend should be accessible at: http://localhost:6041`);
    console.log(`✅ Ready to receive requests from frontend!`);
}); 