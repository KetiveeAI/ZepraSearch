const axios = require('axios');
const cheerio = require('cheerio');
const { URL } = require('url');
const { indexPage } = require('../database/elasticsearchManager');

class WebCrawlerService {
    constructor() {
        this.crawledPages = new Map();
        this.queue = [];
        this.visited = new Set();
        this.maxDepth = 3;
        this.maxPages = 100;
        this.delay = 1000; // 1 second delay between requests
        this.userAgents = [
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        ];
    }

    async startCrawling(seedUrls, options = {}) {
        const {
            maxDepth = this.maxDepth,
            maxPages = this.maxPages,
            delay = this.delay
        } = options;

        this.maxDepth = maxDepth;
        this.maxPages = maxPages;
        this.delay = delay;

        console.log(`🚀 Starting web crawler with ${seedUrls.length} seed URLs`);
        console.log(`📊 Max depth: ${maxDepth}, Max pages: ${maxPages}`);

        // Add seed URLs to queue
        seedUrls.forEach(url => {
            this.addToQueue(url, 0);
        });

        const results = [];
        let pageCount = 0;

        while (this.queue.length > 0 && pageCount < maxPages) {
            const { url, depth } = this.queue.shift();
            
            if (this.visited.has(url) || depth > maxDepth) {
                continue;
            }

            try {
                console.log(`🕷️ Crawling: ${url} (depth: ${depth})`);
                const pageData = await this.crawlPage(url, depth);
                
                if (pageData) {
                    this.crawledPages.set(url, pageData);
                    results.push(pageData);
                    pageCount++;
                    // Index crawled page in Elasticsearch
                    try {
                        await indexPage(pageData);
                    } catch (esErr) {
                        console.warn(`Failed to index page in Elasticsearch: ${url}`, esErr.message);
                    }
                    // Add discovered links to queue
                    if (depth < maxDepth) {
                        pageData.links.forEach(link => {
                            this.addToQueue(link, depth + 1);
                        });
                    }
                }

                // Respect robots.txt and add delay
                await this.delayRequest();
                
            } catch (error) {
                console.warn(`❌ Failed to crawl ${url}:`, error.message);
            }
        }

        console.log(`✅ Crawling completed. Crawled ${pageCount} pages.`);
        return results;
    }

    async crawlPage(url, depth) {
        try {
            const response = await axios.get(url, {
                headers: {
                    'User-Agent': this.getRandomUserAgent(),
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                    'Accept-Language': 'en-US,en;q=0.5',
                    'Accept-Encoding': 'gzip, deflate',
                    'Connection': 'keep-alive'
                },
                timeout: 10000,
                maxRedirects: 5
            });

            const $ = cheerio.load(response.data);
            
            // Extract page content
            const title = $('title').text().trim() || $('h1').first().text().trim() || 'Untitled';
            const description = $('meta[name="description"]').attr('content') || 
                               $('meta[property="og:description"]').attr('content') || '';
            
            // Extract main content (remove navigation, footer, etc.)
            const mainContent = this.extractMainContent($);
            // Defensive: ensure mainContent and links are defined
            const safeMainContent = typeof mainContent === 'string' ? mainContent : '';
            let links = [];
            try {
                links = this.extractLinks($, url);
                if (!Array.isArray(links)) links = [];
            } catch (err) {
                console.warn(`Failed to extract links for ${url}:`, err.message);
                links = [];
            }
            // Extract metadata
            let metadata = {};
            try {
                metadata = this.extractMetadata($, response.headers) || {};
            } catch (err) {
                console.warn(`Failed to extract metadata for ${url}:`, err.message);
                metadata = {};
            }
            return {
                url: url,
                title: title,
                description: description,
                content: safeMainContent,
                links: links,
                metadata: metadata,
                depth: depth,
                crawledAt: new Date().toISOString(),
                status: response.status,
                contentLength: response.data.length
            };
        } catch (error) {
            console.warn(`Failed to crawl ${url}:`, error && error.message ? error.message : error);
            return null;
        }
    }

    extractMainContent($) {
        if (!$ || typeof $ !== 'function') {
            console.warn('extractMainContent: Cheerio instance `$` is invalid or undefined.');
            return '';
        }
        // Remove unwanted elements
        try {
            $('nav, header, footer, .nav, .header, .footer, .sidebar, .menu, script, style, noscript').remove();
        } catch (err) {
            console.warn('extractMainContent: Failed to remove unwanted elements:', err.message);
        }
        // Try to find main content area
        let content = '';
        // Look for common content selectors
        const contentSelectors = [
            'main',
            'article',
            '.content',
            '.main-content',
            '#content',
            '#main',
            '.post-content',
            '.entry-content'
        ];
        for (const selector of contentSelectors) {
            let element;
            try {
                element = $(selector);
            } catch (err) {
                console.warn(`extractMainContent: Failed to select ${selector}:`, err.message);
                continue;
            }
            if (element && typeof element.length === 'number' && element.length > 0) {
                content = element.text().trim();
                break;
            } else if (element === undefined) {
                console.warn(`extractMainContent: Selector ${selector} returned undefined.`);
            }
        }
        // If no specific content area found, use body text
        if (!content) {
            try {
                const body = $('body');
                if (body && typeof body.text === 'function') {
                    content = body.text().trim();
                } else {
                    console.warn('extractMainContent: $("body") is invalid.');
                    content = '';
                }
            } catch (err) {
                console.warn('extractMainContent: Failed to extract body text:', err.message);
                content = '';
            }
        }
        // Clean up the content
        try {
            return this.cleanText(content);
        } catch (err) {
            console.warn('extractMainContent: Failed to clean text:', err.message);
            return content;
        }
    }

    extractLinks($, baseUrl) {
        const links = new Set();
        const baseUrlObj = new URL(baseUrl);

        $('a[href]').each((i, element) => {
            const href = $(element).attr('href');
            if (!href) return;

            try {
                let fullUrl;
                
                if (href.startsWith('http')) {
                    fullUrl = href;
                } else if (href.startsWith('/')) {
                    fullUrl = `${baseUrlObj.protocol}//${baseUrlObj.host}${href}`;
                } else {
                    fullUrl = new URL(href, baseUrl).href;
                }

                // Only include links from the same domain or trusted domains
                const urlObj = new URL(fullUrl);
                if (urlObj.hostname === baseUrlObj.hostname || 
                    this.isTrustedDomain(urlObj.hostname)) {
                    links.add(fullUrl);
                }
            } catch (error) {
                // Skip invalid URLs
            }
        });

        return Array.from(links);
    }

    extractMetadata($, headers) {
        // OpenGraph
        const og = {};
        $('meta[property^="og:"]').each((i, el) => {
            const prop = $(el).attr('property');
            const content = $(el).attr('content');
            if (prop && content) og[prop.replace('og:', '')] = content;
        });
        // Schema.org (JSON-LD)
        let schema = {};
        $('script[type="application/ld+json"]').each((i, el) => {
            try {
                const json = JSON.parse($(el).html());
                schema = { ...schema, ...json };
            } catch {}
        });
        // Canonical & Alternate
        const canonical = $('link[rel="canonical"]').attr('href') || '';
        const alternate = $('link[rel="alternate"]').attr('href') || '';
        // Reading time (words/200)
        const text = $('body').text() || '';
        const wordCount = text.split(/\s+/).length;
        const readingTimeMin = Math.ceil(wordCount / 200);
        // Performance (content length, headers)
        return {
            language: $('html').attr('lang') || 'en',
            charset: $('meta[charset]').attr('charset') || 
                     $('meta[http-equiv="Content-Type"]').attr('content') || 'utf-8',
            keywords: $('meta[name="keywords"]').attr('content') || '',
            author: $('meta[name="author"]').attr('content') || '',
            robots: $('meta[name="robots"]').attr('content') || '',
            lastModified: headers['last-modified'] || '',
            contentType: headers['content-type'] || '',
            favicon: $('link[rel="icon"]').attr('href') || 
                     $('link[rel="shortcut icon"]').attr('href') || '',
            og,
            schema,
            canonical,
            alternate,
            readingTimeMin,
            wordCount,
            headers: headers || {},
        };
    }

    cleanText(text) {
        return text
            .replace(/\s+/g, ' ') // Replace multiple spaces with single space
            .replace(/\n+/g, '\n') // Replace multiple newlines with single newline
            .trim();
    }

    isTrustedDomain(hostname) {
        const trustedDomains = [
            'wikipedia.org',
            'github.com',
            'stackoverflow.com',
            'medium.com',
            'dev.to',
            'css-tricks.com',
            'mdn.io',
            'web.dev'
        ];

        return trustedDomains.some(domain => hostname.includes(domain));
    }

    addToQueue(url, depth) {
        if (!this.visited.has(url) && depth <= this.maxDepth) {
            this.queue.push({ url, depth });
        }
    }

    async delayRequest() {
        return new Promise(resolve => setTimeout(resolve, this.delay));
    }

    getRandomUserAgent() {
        return this.userAgents[Math.floor(Math.random() * this.userAgents.length)];
    }

    async searchInCrawledContent(query) {
        const results = [];
        const queryLower = query.toLowerCase();

        for (const [url, pageData] of this.crawledPages) {
            const titleMatch = pageData.title.toLowerCase().includes(queryLower);
            const contentMatch = pageData.content.toLowerCase().includes(queryLower);
            const descriptionMatch = pageData.description.toLowerCase().includes(queryLower);

            if (titleMatch || contentMatch || descriptionMatch) {
                let score = 0;
                if (titleMatch) score += 0.5;
                if (contentMatch) score += 0.3;
                if (descriptionMatch) score += 0.2;

                results.push({
                    url: pageData.url,
                    title: pageData.title,
                    snippet: this.generateSnippet(pageData.content, query),
                    score: score,
                    source: 'crawled',
                    crawledAt: pageData.crawledAt
                });
            }
        }

        // Sort by relevance score
        results.sort((a, b) => b.score - a.score);
        return results;
    }

    generateSnippet(content, query) {
        const queryLower = query.toLowerCase();
        const contentLower = content.toLowerCase();
        const index = contentLower.indexOf(queryLower);
        
        if (index === -1) {
            return content.substring(0, 200) + '...';
        }

        const start = Math.max(0, index - 100);
        const end = Math.min(content.length, index + query.length + 100);
        return content.substring(start, end) + '...';
    }

    getCrawlerStats() {
        return {
            totalPages: this.crawledPages.size,
            queueSize: this.queue.length,
            visitedUrls: this.visited.size,
            maxDepth: this.maxDepth,
            maxPages: this.maxPages,
            lastCrawled: this.crawledPages.size > 0 ? 
                Array.from(this.crawledPages.values())
                    .sort((a, b) => new Date(b.crawledAt) - new Date(a.crawledAt))[0].crawledAt : null
        };
    }

    /**
     * Bulk index all cached crawled pages into Elasticsearch (call on startup)
     */
    async indexAllCachedPages() {
        let count = 0;
        for (const [url, pageData] of this.crawledPages) {
            try {
                await indexPage(pageData);
                count++;
            } catch (esErr) {
                console.warn(`Failed to bulk index page: ${url}`, esErr.message);
            }
        }
        console.log(`Indexed ${count} cached pages to Elasticsearch.`);
    }

    clearCache() {
        this.crawledPages.clear();
        this.queue = [];
        this.visited.clear();
    }

    async fetchSitemapAndExpand(baseUrl, currentDepth = 0) {
        if (currentDepth > this.maxDepth || this.visited.has(baseUrl)) return;
        try {
            const urlObj = new URL(baseUrl);
            const sitemapUrl = `${urlObj.protocol}//${urlObj.host}/sitemap.xml`;
            const response = await axios.get(sitemapUrl, { timeout: 8000 });
            if (response.status === 200 && response.data) {
                const matches = response.data.match(/<loc>(.*?)<\/loc>/g);
                if (matches) {
                    matches.forEach(m => {
                        const url = m.replace(/<\/?loc>/g, '').trim();
                        if (url && !this.visited.has(url)) {
                            this.addToQueue(url, currentDepth + 1);
                        }
                    });
                }
                console.log(`Sitemap found: added ${matches ? matches.length : 0} URLs from ${sitemapUrl}`);
            }
        } catch (err) {
            console.warn(`No sitemap at ${baseUrl}:`, err.message);
        }
    }
}
module.exports = WebCrawlerService;