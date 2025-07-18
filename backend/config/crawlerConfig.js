module.exports = {
    // Seed URLs to start crawling from
    seedUrls: [
        'https://ketivee.com',
        'https://docs.ketivee.com',
        'https://github.com/ketivee',
        'https://blog.ketivee.com'
    ],

    // Crawling parameters
    crawling: {
        maxDepth: 3,           // Maximum depth to crawl
        maxPages: 1000,        // Maximum number of pages to crawl
        delay: 1000,           // Delay between requests (ms)
        timeout: 10000,        // Request timeout (ms)
        userAgent: 'KetiveeSearchBot/2.0 (+https://ketivee.com/bot)',
        respectRobots: true,   // Respect robots.txt
        followRedirects: true, // Follow redirects
        maxRedirects: 5        // Maximum number of redirects to follow
    },

    // Content filtering
    contentFilter: {
        // File types to include
        includeTypes: [
            'text/html',
            'application/xhtml+xml',
            'text/plain'
        ],
        
        // File extensions to include
        includeExtensions: [
            '.html', '.htm', '.xml', '.txt', '.md'
        ],
        
        // File extensions to exclude
        excludeExtensions: [
            '.pdf', '.doc', '.docx', '.xls', '.xlsx',
            '.ppt', '.pptx', '.zip', '.rar', '.tar',
            '.gz', '.jpg', '.jpeg', '.png', '.gif',
            '.mp4', '.avi', '.mov', '.mp3', '.wav'
        ],
        
        // URL patterns to exclude
        excludePatterns: [
            '/admin/',
            '/private/',
            '/api/',
            '/login',
            '/logout',
            '/register',
            '/password',
            'mailto:',
            'tel:',
            'javascript:',
            '#',
            '?utm_',
            '?fbclid=',
            '?gclid='
        ]
    },

    // Domain restrictions
    domains: {
        // Allow crawling from these domains
        allowed: [
            'ketivee.com',
            'docs.ketivee.com',
            'blog.ketivee.com',
            'github.com',
            'stackoverflow.com',
            'wikipedia.org'
        ],
        
        // Block crawling from these domains
        blocked: [
            'facebook.com',
            'twitter.com',
            'instagram.com',
            'linkedin.com',
            'youtube.com',
            'pinterest.com',
            'reddit.com',
            'tumblr.com'
        ]
    },

    // Content processing
    processing: {
        // Minimum content length to index
        minContentLength: 100,
        
        // Maximum content length to index
        maxContentLength: 50000,
        
        // Keywords to boost relevance
        boostKeywords: [
            'tutorial', 'guide', 'documentation', 'example',
            'learn', 'education', 'course', 'lesson',
            'how to', 'best practices', 'reference', 'api'
        ],
        
        // Educational content indicators
        educationalIndicators: [
            'tutorial', 'learn', 'course', 'education', 'study',
            'guide', 'how to', 'documentation', 'reference',
            'manual', 'textbook', 'lesson', 'class', 'training',
            'workshop', 'seminar', 'lecture', 'explanation'
        ]
    },

    // Storage configuration
    storage: {
        // Database collection names
        collections: {
            pages: 'crawled_pages',
            links: 'page_links',
            metadata: 'page_metadata',
            index: 'search_index'
        },
        
        // Index configuration
        indexConfig: {
            titleWeight: 10,
            descriptionWeight: 5,
            contentWeight: 1,
            urlWeight: 2,
            keywordWeight: 3
        }
    },

    // Monitoring and logging
    monitoring: {
        // Log levels: 'debug', 'info', 'warn', 'error'
        logLevel: 'info',
        
        // Save crawl statistics
        saveStats: true,
        
        // Performance monitoring
        trackPerformance: true,
        
        // Error reporting
        reportErrors: true
    },

    // Rate limiting
    rateLimiting: {
        enabled: true,
        requestsPerSecond: 1,
        burstSize: 5,
        windowMs: 60000
    },

    // Retry configuration
    retry: {
        maxRetries: 3,
        retryDelay: 5000,
        backoffMultiplier: 2
    },

    // Content extraction
    extraction: {
        // Extract title from these selectors (in order of preference)
        titleSelectors: [
            'title',
            'h1',
            'meta[property="og:title"]',
            'meta[name="title"]'
        ],
        
        // Extract description from these selectors
        descriptionSelectors: [
            'meta[name="description"]',
            'meta[property="og:description"]',
            'meta[name="summary"]'
        ],
        
        // Extract main content from these selectors
        contentSelectors: [
            'main',
            'article',
            '.content',
            '.main-content',
            '#content',
            '#main',
            '.post-content',
            '.entry-content'
        ],
        
        // Remove these elements from content
        removeSelectors: [
            'nav', 'header', 'footer', '.nav', '.header', '.footer',
            '.sidebar', '.menu', 'script', 'style', 'noscript',
            '.advertisement', '.ads', '.banner', '.popup'
        ]
    },

    // Language detection
    language: {
        enabled: true,
        defaultLanguage: 'en',
        supportedLanguages: ['en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'zh', 'ja', 'ko']
    },

    // Duplicate detection
    duplicateDetection: {
        enabled: true,
        similarityThreshold: 0.8,
        checkFields: ['title', 'content', 'url']
    },

    // Quality scoring
    qualityScoring: {
        enabled: true,
        factors: {
            contentLength: 0.2,
            titleQuality: 0.3,
            descriptionQuality: 0.2,
            linkQuality: 0.1,
            domainAuthority: 0.2
        }
    }
}; 