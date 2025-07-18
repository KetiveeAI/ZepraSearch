module.exports = {
    // Server Configuration
    PORT: process.env.PORT || 6329,
    NODE_ENV: process.env.NODE_ENV || 'development',

    // Frontend URL
    FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:4045',

    // Database Configuration
    MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/ketivee_search',
    REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',

    // Search Engine Configuration
    SEARCH_CACHE_TTL: process.env.SEARCH_CACHE_TTL || 3600,
    SUGGESTION_CACHE_TTL: process.env.SUGGESTION_CACHE_TTL || 1800,
    MAX_SEARCH_RESULTS: process.env.MAX_SEARCH_RESULTS || 100,
    MIN_QUERY_LENGTH: process.env.MIN_QUERY_LENGTH || 2,

    // Security
    RATE_LIMIT_WINDOW: process.env.RATE_LIMIT_WINDOW || 900000,
    RATE_LIMIT_MAX_REQUESTS: process.env.RATE_LIMIT_MAX_REQUESTS || 100,

    // Logging
    LOG_LEVEL: process.env.LOG_LEVEL || 'info'
}; 