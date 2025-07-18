const axios = require('axios');
const cheerio = require('cheerio');
const { URL } = require('url');
const WebCrawlerService = require('./webCrawlerService');
const WebSearchService = require('./webSearchService');
const ModelManager = require('../models/ModelManager');

class RealSearchService {
    constructor(db = null) {
        this.cache = new Map();
        this.cacheTimeout = 3600000; // 1 hour
        this.webCrawler = new WebCrawlerService();
        this.webSearch = new WebSearchService();
        
        // Initialize database models if db is provided
        this.modelManager = db ? new ModelManager(db) : null;
        
        // Initialize with some educational and tech websites
        this.seedUrls = [
            'https://stackoverflow.com',
            'https://github.com'
        ];
        
        // Disabled automatic crawling - only search when user queries
        // this.initializeCrawling();
    }

    async initializeCrawling() {
        try {
            console.log('🚀 Initializing real search with web crawling...');
            await this.webCrawler.startCrawling(this.seedUrls, {
                maxDepth: 2,
                maxPages: 50,
                delay: 2000
            });
            console.log('✅ Initial crawling completed');
        } catch (error) {
            console.warn('Initial crawling failed:', error.message);
        }
    }

    async search({ query, page = 1, limit = 10, type = 'all', userId = null, sessionId = null }) {
        const start = Date.now();
        const cacheKey = `real_search:${query}:${page}:${limit}:${type}`;
        
        // Check cache first
        if (this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            if (Date.now() - cached.timestamp < this.cacheTimeout) {
                return cached.data;
            }
        }

        try {
            // Get real search results from multiple sources
            let results = [];
            
            // 1. Search in crawled content
            const crawledResults = await this.webCrawler.searchInCrawledContent(query);
            results = results.concat(crawledResults);
            
            // 2. Search using web search service
            const webResults = await this.webSearch.search(query, limit);
            results = results.concat(webResults);
            
            // 3. If we don't have enough results, try additional sources
            if (results.length < limit) {
                const additionalResults = await this.searchAdditionalSources(query, limit - results.length);
                results = results.concat(additionalResults);
            }

            // Remove duplicates
            results = this.deduplicateResults(results);

            // Enhanced category filtering
            if (type && type !== 'all') {
                results = this.filterByCategory(results, type);
            }

            // Enhanced educational content detection
            results = this.enhanceEducationalContent(results, query);

            // Sort by relevance score
            results.sort((a, b) => (b.score || 0) - (a.score || 0));

            // Paginate results
            const startIndex = (page - 1) * limit;
            const endIndex = startIndex + limit;
            const paginatedResults = results.slice(startIndex, endIndex);

            // Enhance results with additional data
            const enhancedResults = await this.enhanceResults(paginatedResults);

            // FILTER OUT LOW-QUALITY RESULTS - Only keep valid, high-quality results
            const validResults = this.filterValidResults(enhancedResults, query);

            // Save ONLY valid results to database if modelManager is available
            if (this.modelManager && validResults.length > 0) {
                try {
                    await this.modelManager.processSearchResults(validResults, query, userId, sessionId);
                } catch (dbError) {
                    console.warn('Failed to save results to database:', dbError.message);
                }
            }

            const response = {
                query: query,
                originalQuery: query,
                page: page,
                total: validResults.length,
                pages: Math.ceil(validResults.length / limit),
                results: validResults,
                latency: `${Date.now() - start}ms`,
                engines: {
                    web_crawler: true,
                    web_search: true,
                    real_search: true,
                    independent: true,
                    database_sync: !!this.modelManager,
                    quality_filtered: true
                },
                categories: this.getAvailableCategories(),
                educationalContent: this.detectEducationalIntent(query),
                quality_metrics: {
                    total_candidates: enhancedResults.length,
                    valid_results: validResults.length,
                    filtered_out: enhancedResults.length - validResults.length,
                    average_quality_score: this.calculateAverageQuality(validResults)
                }
            };

            // Cache the results
            this.cache.set(cacheKey, {
                data: response,
                timestamp: Date.now()
            });

            return response;

        } catch (error) {
            console.error('Real search error:', error);
            throw error;
        }
    }

    async searchAdditionalSources(query, limit) {
        const results = [];
        
        try {
            // Try searching specific educational websites
            const educationalSites = [
                'https://www.w3schools.com',
                'https://www.tutorialspoint.com',
                'https://www.geeksforgeeks.org',
                'https://www.freecodecamp.org'
            ];
            
            for (const site of educationalSites) {
                if (results.length >= limit) break;
                
                try {
                    const siteResults = await this.searchEducationalSite(site, query, limit - results.length);
                    results.push(...siteResults);
                } catch (error) {
                    console.warn(`Educational site ${site} search failed:`, error.message);
                }
            }
            
        } catch (error) {
            console.warn('Additional sources search failed:', error.message);
        }
        
        return results;
    }

    async searchEducationalSite(site, query, limit) {
        const results = [];
        
        try {
            // Create a search URL for the educational site
            const searchUrl = `${site}/search?q=${encodeURIComponent(query)}`;
            
            const response = await axios.get(searchUrl, {
                headers: {
                    'User-Agent': this.getRandomUserAgent()
                },
                timeout: 10000
            });
            
            const $ = cheerio.load(response.data);
            
            // Look for links that might contain the query
            $('a[href]').each((i, element) => {
                if (results.length >= limit) return false;
                
                const href = $(element).attr('href');
                const title = $(element).text().trim();
                
                if (href && title && href.startsWith('http') && 
                    (title.toLowerCase().includes(query.toLowerCase()) || 
                     href.toLowerCase().includes(query.toLowerCase()))) {
                    
                    results.push({
                        url: href,
                        title: title,
                        snippet: `Found on ${new URL(site).hostname}`,
                        score: 0.6,
                        source: 'educational_site',
                        category: 'educational'
                    });
                }
            });
            
        } catch (error) {
            console.warn(`Educational site ${site} search failed:`, error.message);
        }
        
        return results;
    }

    async searchWeb(query, limit) {
        // Use the web search service instead
        return await this.webSearch.search(query, limit);
    }

    /**
     * Enhanced crawlForQuery: crawl, validate real/fake, expand via sitemap if needed, index real results
     */
    async crawlForQuery(query, limit) {
        const results = [];
        
        try {
            // Create search URLs based on the query
            const searchUrls = [
                `https://developer.mozilla.org/en-US/search?q=${encodeURIComponent(query)}`,
                `https://stackoverflow.com/search?q=${encodeURIComponent(query)}`,
                `https://github.com/search?q=${encodeURIComponent(query)}`
            ];
            
            for (const url of searchUrls) {
                // Fetch sitemap for the domain and expand crawl queue
                await this.webCrawler.fetchSitemapAndExpand(url, 0);
                if (results.length >= limit) break;
                
                try {
                    const response = await axios.get(url, {
                        headers: {
                            'User-Agent': this.getRandomUserAgent()
                        },
                        timeout: 10000
                    });
                    
                    const $ = cheerio.load(response.data);
                    
                    // Extract results based on the site structure
                    const anchorElements = $('a[href]').toArray();
for (const element of anchorElements) {
    if (results.length >= limit) break;
    const href = $(element).attr('href');
    const title = $(element).text().trim();
    if (href && title && href.startsWith('http') && 
        (title.toLowerCase().includes(query.toLowerCase()) || 
         href.toLowerCase().includes(query.toLowerCase()))) {
        // Crawl the page for real content (deep crawl)
        const pageData = await this.webCrawler.crawlPage(href, 1);
        if (pageData && this.webCrawler.isRealPage(pageData)) {
            // Index to Elasticsearch
            await elasticsearchManager.indexPage({
                url: pageData.url,
                title: pageData.title,
                content: pageData.content,
                crawledAt: pageData.crawledAt,
                metadata: pageData.metadata
            });
            results.push({
                url: pageData.url,
                title: pageData.title,
                snippet: pageData.description || pageData.content.substring(0, 180),
                score: 1.0,
                                    source: 'crawled_real',
                                    category: this.categorizeUrl(pageData.url)
                                });
                            } // else skip fake/dummy
                        }
                    }
                    
                } catch (error) {
                    console.warn(`Failed to crawl ${url}:`, error.message);
                }
            }
            
        } catch (error) {
            console.warn('Query crawling failed:', error.message);
        }
        
        return results;
    }

    async internalSearch(query, page, limit, type) {
        // Use the web crawler's search functionality
        const results = await this.webCrawler.searchInCrawledContent(query);
        
        // Filter by type if specified
        if (type && type !== 'all') {
            return results.filter(result => result.category === type);
        }

        return results;
    }

    async enhanceResults(results) {
        const enhanced = [];
        
        for (const result of results) {
            try {
                // Get additional metadata for each result
                const metadata = await this.getPageMetadata(result.url);
                
                enhanced.push({
                    ...result,
                    ...metadata,
                    isEducational: this.isEducationalDomain(result.url),
                    educationalType: this.getEducationalType(result.url, result.title),
                    educationalLevel: this.getEducationalLevel(result.url, result.title),
                    subjects: this.extractSubjects(result.title, result.snippet),
                    hasExercises: this.hasExercises(result.snippet),
                    hasExamples: this.hasExamples(result.snippet)
                });
            } catch (error) {
                // If metadata fetch fails, use the original result
                enhanced.push(result);
            }
        }
        
        return enhanced;
    }

    async getPageMetadata(url) {
        try {
            const response = await axios.get(url, {
                headers: {
                    'User-Agent': this.getRandomUserAgent()
                },
                timeout: 5000
            });
            
            const $ = cheerio.load(response.data);
            
            return {
                description: $('meta[name="description"]').attr('content') || 
                             $('meta[property="og:description"]').attr('content') || '',
                keywords: $('meta[name="keywords"]').attr('content') || '',
                author: $('meta[name="author"]').attr('content') || '',
                language: $('html').attr('lang') || 'en',
                lastModified: response.headers['last-modified'] || '',
                contentLength: response.data.length
            };
        } catch (error) {
            return {
                description: '',
                keywords: '',
                author: '',
                language: 'en',
                lastModified: '',
                contentLength: 0
            };
        }
    }

    deduplicateResults(results) {
        const seen = new Set();
        return results.filter(result => {
            const key = result.url.toLowerCase();
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });
    }

    filterByCategory(results, type) {
        if (type === 'all') return results;
        return results.filter(result => result.category === type);
    }

    categorizeUrl(url) {
        const urlLower = url.toLowerCase();
        
        if (urlLower.includes('tutorial') || urlLower.includes('learn') || urlLower.includes('course')) {
            return 'educational';
        } else if (urlLower.includes('news') || urlLower.includes('article')) {
            return 'news';
        } else if (urlLower.includes('shop') || urlLower.includes('store') || urlLower.includes('buy')) {
            return 'shopping';
        } else if (urlLower.includes('travel') || urlLower.includes('hotel') || urlLower.includes('flight')) {
            return 'travel';
        } else if (urlLower.includes('github.com') || urlLower.includes('stackoverflow.com') || urlLower.includes('developer.mozilla.org')) {
            return 'technology';
        } else {
            return 'general';
        }
    }

    enhanceEducationalContent(results, query) {
        return results.map(result => {
            const isEducational = this.isEducationalDomain(result.url);
            const educationalType = this.getEducationalType(result.url, result.title);
            const educationalLevel = this.getEducationalLevel(result.url, result.title);
            const subjects = this.extractSubjects(result.title, result.snippet);
            
            return {
                ...result,
                isEducational,
                educationalType,
                educationalLevel,
                subjects,
                hasExercises: this.hasExercises(result.snippet),
                hasExamples: this.hasExamples(result.snippet)
            };
        });
    }

    isEducationalDomain(url) {
        const educationalDomains = [
            'developer.mozilla.org',
            'w3schools.com',
            'stackoverflow.com',
            'github.com',
            'tutorialspoint.com',
            'geeksforgeeks.org',
            'freecodecamp.org',
            'codecademy.com',
            'udemy.com',
            'coursera.org',
            'edx.org',
            'khanacademy.org',
            'wikipedia.org'
        ];
        
        return educationalDomains.some(domain => url.includes(domain));
    }

    getEducationalType(url, title) {
        const titleLower = title.toLowerCase();
        const urlLower = url.toLowerCase();
        
        if (titleLower.includes('tutorial') || urlLower.includes('tutorial')) return 'tutorial';
        if (titleLower.includes('course') || urlLower.includes('course')) return 'course';
        if (titleLower.includes('documentation') || urlLower.includes('docs')) return 'documentation';
        if (titleLower.includes('guide') || titleLower.includes('how-to')) return 'guide';
        if (titleLower.includes('reference') || urlLower.includes('reference')) return 'reference';
        
        return 'general';
    }

    getEducationalLevel(url, title) {
        const titleLower = title.toLowerCase();
        
        if (titleLower.includes('beginner') || titleLower.includes('basic')) return 'beginner';
        if (titleLower.includes('intermediate') || titleLower.includes('advanced')) return 'intermediate';
        if (titleLower.includes('expert') || titleLower.includes('master')) return 'expert';
        
        return 'all-levels';
    }

    extractSubjects(title, snippet) {
        const subjects = [];
        const text = `${title} ${snippet}`.toLowerCase();
        
        const subjectKeywords = {
            'programming': ['programming', 'coding', 'code', 'developer', 'development'],
            'javascript': ['javascript', 'js', 'es6', 'react', 'vue', 'angular'],
            'python': ['python', 'django', 'flask', 'pandas', 'numpy'],
            'web': ['web', 'html', 'css', 'frontend', 'backend', 'fullstack'],
            'database': ['database', 'sql', 'mongodb', 'mysql', 'postgresql'],
            'ai': ['artificial intelligence', 'machine learning', 'ai', 'ml', 'neural'],
            'data': ['data science', 'data analysis', 'big data', 'analytics']
        };
        
        for (const [subject, keywords] of Object.entries(subjectKeywords)) {
            if (keywords.some(keyword => text.includes(keyword))) {
                subjects.push(subject);
            }
        }
        
        return subjects;
    }

    hasExercises(snippet) {
        return snippet.toLowerCase().includes('exercise') || snippet.toLowerCase().includes('practice');
    }

    hasExamples(snippet) {
        return snippet.toLowerCase().includes('example') || snippet.toLowerCase().includes('sample');
    }

    detectEducationalIntent(query) {
        const educationalKeywords = [
            'learn', 'tutorial', 'course', 'guide', 'how to', 'step by step',
            'beginner', 'basics', 'fundamentals', 'introduction', 'getting started'
        ];
        
        const queryLower = query.toLowerCase();
        return educationalKeywords.some(keyword => queryLower.includes(keyword));
    }

    getEducationalSuggestions(query) {
        const suggestions = [];
        const queryLower = query.toLowerCase();
        
        if (queryLower.includes('javascript')) {
            suggestions.push('JavaScript Tutorial for Beginners', 'ES6 Features Guide', 'React.js Fundamentals');
        } else if (queryLower.includes('python')) {
            suggestions.push('Python for Beginners', 'Django Web Development', 'Data Science with Python');
        } else if (queryLower.includes('web')) {
            suggestions.push('Web Development', 'Web Design', 'Web Security');
        }
        
        return suggestions;
    }

    getAvailableCategories() {
        return [
            { id: 'all', name: 'All Results', description: 'Search across all categories' },
            { id: 'educational', name: 'Educational', description: 'Tutorials, courses, and learning resources' },
            { id: 'technology', name: 'Technology', description: 'Programming, development, and tech news' },
            { id: 'news', name: 'News', description: 'Latest news and current events' },
            { id: 'shopping', name: 'Shopping', description: 'Products and e-commerce' },
            { id: 'travel', name: 'Travel', description: 'Travel guides and tourism information' },
            { id: 'general', name: 'General', description: 'General web content and information' }
        ];
    }

    formatCategoryName(category) {
        const categoryMap = {
            'all': 'All Results',
            'educational': 'Educational',
            'technology': 'Technology',
            'news': 'News',
            'shopping': 'Shopping',
            'travel': 'Travel',
            'general': 'General'
        };
        
        return categoryMap[category] || category;
    }

    getCategoryDescription(category) {
        const descriptions = {
            'all': 'Search across all categories and content types',
            'educational': 'Find tutorials, courses, documentation, and learning resources',
            'technology': 'Programming, software development, and technology-related content',
            'news': 'Latest news, current events, and breaking stories',
            'shopping': 'Products, reviews, and e-commerce information',
            'travel': 'Travel guides, tourism, and destination information',
            'general': 'General web content and information'
        };
        
        return descriptions[category] || 'General web content';
    }

    getRandomUserAgent() {
        return this.userAgents[Math.floor(Math.random() * this.userAgents.length)];
    }

    async getSuggestions(query) {
        if (query.length < 2) return [];
        
        // Get suggestions from crawled content
        const suggestions = [];
        const queryLower = query.toLowerCase();
        
        // Search in crawled pages for suggestions
        for (const [url, pageData] of this.webCrawler.crawledPages) {
            if (pageData.title.toLowerCase().includes(queryLower)) {
                suggestions.push(pageData.title);
            }
        }
        
        // Add some common suggestions based on the query
        if (queryLower.includes('javascript')) {
            suggestions.push('JavaScript Tutorial', 'JavaScript ES6', 'JavaScript DOM');
        } else if (queryLower.includes('python')) {
            suggestions.push('Python Tutorial', 'Python Django', 'Python Data Science');
        } else if (queryLower.includes('web')) {
            suggestions.push('Web Development', 'Web Design', 'Web Security');
        }
        
        return [...new Set(suggestions)].slice(0, 5);
    }

    async getStats() {
        const crawlerStats = this.webCrawler.getCrawlerStats();
        
        const baseStats = {
            totalPages: crawlerStats.totalPages,
            queueSize: crawlerStats.queueSize,
            visitedUrls: crawlerStats.visitedUrls,
            cacheSize: this.cache.size,
            lastCrawled: crawlerStats.lastCrawled,
            searchEngines: this.webSearch.searchEngines.length,
            seedUrls: this.seedUrls.length,
            independent: true,
            realData: true,
            noMockData: true,
            database_sync: !!this.modelManager
        };

        // Add database statistics if modelManager is available
        if (this.modelManager) {
            try {
                const dbStats = await this.modelManager.getComprehensiveStats();
                return {
                    ...baseStats,
                    database: dbStats
                };
            } catch (error) {
                console.warn('Failed to get database stats:', error.message);
                return {
                    ...baseStats,
                    database: { error: 'Database stats unavailable' }
                };
            }
        }

        return baseStats;
    }

    // Filter out low-quality or irrelevant results
    filterValidResults(results, query) {
        return results.filter(result => {
            // Basic validation
            if (!result.url || !result.title || !result.url.startsWith('http')) {
                return false;
            }

            // Filter out spam domains
            const urlLower = result.url.toLowerCase();
            if (urlLower.includes('baidu.com') || 
                urlLower.includes('zhihu.com') ||
                urlLower.includes('weibo.com') ||
                urlLower.includes('qq.com')) {
                return false;
            }

            // Quality checks
            if (result.title.length < 5 || result.title.length > 200) {
                return false;
            }

            // Relevance check - title should contain query terms
            const queryTerms = query.toLowerCase().split(' ');
            const titleLower = result.title.toLowerCase();
            const hasRelevantTerms = queryTerms.some(term => 
                titleLower.includes(term) || 
                (result.snippet && result.snippet.toLowerCase().includes(term))
            );

            if (!hasRelevantTerms) {
                return false;
            }

            // Score threshold
            if ((result.score || 0) < 0.1) {
                return false;
            }

            // Content quality check
            if (result.snippet && result.snippet.length < 10) {
                return false;
            }

            return true;
        });
    }

    // NEW: Calculate average quality score
    calculateAverageQuality(results) {
        if (results.length === 0) return 0;
        const totalScore = results.reduce((sum, result) => sum + (result.score || 0), 0);
        return totalScore / results.length;
    }
}

module.exports = RealSearchService; 